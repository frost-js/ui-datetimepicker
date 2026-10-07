import { expect, test } from '#test';

test.describe('DateTimePicker forms', () => {
    test.use({ pickerDefaults: { format: 'yyyy-MM-dd' } });

    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
            $.setHtml(document.body,
                '<form id="form"><fieldset id="fields"><label for="date">Appointment</label>' +
                '<input id="date" name="appointment" class="input-outline" value="2026-09-15" required></fieldset>' +
                '<button type="reset">Reset</button><button type="submit">Submit</button></form>',
            );
        });
    });

    test.describe('native synchronization', () => {
        test('updates the selection after typing without a duplicate native change event', async ({ page }) => {
            await page.evaluate(() => {
                UI.DateTimePicker.init($.findOne('#date'));
                $.findOne('#date').addEventListener('change', (event) => {
                    $.setDataset(event.target, 'changes', ($.getDataset(event.target, 'changes') || 0) + 1);
                });
            });

            await page.getByLabel('Appointment').fill('2026-10-16');
            await page.getByLabel('Appointment').press('Tab');

            await expect(page.getByLabel('Appointment')).toHaveAttribute('data-changes', '1');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate').format('yyyy-MM-dd'))).toBe('2026-10-16');
        });

        test('normalizes alternate native input silently', async ({ page }) => {
            await page.evaluate(() => {
                UI.DateTimePicker.init($.findOne('#date'), { altFormats: ['dd/MM/yyyy'] });
                $.findOne('#date').addEventListener('change', (event) => {
                    $.setDataset(event.target, 'changes', ($.getDataset(event.target, 'changes') || 0) + 1);
                });
                $.findOne('#date').value = '16/10/2026';
                $.findOne('#date').dispatchEvent(new Event('change', { bubbles: true }));
            });

            await expect(page.getByLabel('Appointment')).toHaveValue('2026-10-16');
            await expect(page.getByLabel('Appointment')).toHaveAttribute('data-changes', '1');
        });

        test('normalizes typed dates using a custom separator', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                multiDate: true,
                multiDateSeparator: ';',
            }));

            await page.getByLabel('Appointment').fill('2026-09-16;2026-09-15;2026-09-16');
            await page.getByLabel('Appointment').press('Tab');

            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15;2026-09-16');
        });

        test.describe('keepInvalid option', () => {
            for (const keepInvalid of [false, true]) {
                test(`handles invalid text with keepInvalid=${keepInvalid}`, async ({ page }) => {
                    await page.evaluate((keep) => {
                        const picker = UI.DateTimePicker.init($.findOne('#date'), {
                            format: 'yyyy-MM-dd',
                            keepInvalid: keep,
                        });

                        picker.setDate('2026-09-15');
                    }, keepInvalid);

                    await page.getByLabel('Appointment').fill('not a date');
                    await page.getByLabel('Appointment').press('Tab');

                    await expect(page.getByLabel('Appointment')).toHaveValue(keepInvalid ? 'not a date' : '2026-09-15');

                    if (keepInvalid) {
                        expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
                    }
                });
            }
        });

        test('updates inline calendars from a native change', async ({ page }) => {
            await page.evaluate(() => {
                UI.DateTimePicker.init($.findOne('#date'), { inline: true });
                $.findOne('#date').value = '2026-10-16';
                $.findOne('#date').dispatchEvent(new Event('change', { bubbles: true }));
            });

            await expect(page.getByRole('button', { name: 'October 16, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
        });
    });

    test.describe('submission', () => {
        test('submits the formatted native value', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date')).setDate([2026, 10, 16]));

            expect(await page.evaluate(() => new FormData($.findOne('form')).get('appointment'))).toBe('2026-10-16');
        });

        test('keeps native required validation', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date')).clear());

            await expect(page.getByLabel('Appointment')).toHaveValue('');
            expect(await page.getByLabel('Appointment').evaluate((node) => node.validity.valueMissing)).toBe(true);
        });
    });

    test.describe('disabled state', () => {
        for (const target of ['#date', '#fields']) {
            test(`synchronizes inline disabled state without rebuilding (${target})`, async ({ page }) => {
                await page.evaluate(() => {
                    UI.DateTimePicker.init($.findOne('#date'), {
                        inline: true,
                        minDate: '2026-09-15',
                    });
                    window.selectedCell = $.findOne('[aria-label="September 15, 2026"]');
                    $.addEvent('#date', 'change.ui.datetimepicker refresh.ui.datetimepicker', () => $.setDataset('#date', 'notified', true));
                });

                const focused = page.getByRole('button', { name: 'September 17, 2026', exact: true });

                await focused.dispatchEvent('mousedown');
                await page.evaluate((selector) => $.setProperty(selector, 'disabled', true), target);

                await expect(page.locator('#date')).toBeDisabled();
                await expect(page.locator('.datetimepicker')).toHaveClass(/datetimepicker-disabled/);
                await expect(focused).toBeDisabled();
                await expect(page.locator('.datetimepicker [tabindex="0"]')).toHaveCount(0);
                expect(await page.evaluate(() => new FormData($.findOne('form')).has('appointment'))).toBe(false);

                await page.evaluate((selector) => $.setProperty(selector, 'disabled', false), target);

                await expect(focused).toBeEnabled();
                await expect(focused).toHaveAttribute('tabindex', '0');
                await expect(page.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);
                await expect(page.getByRole('button', { name: 'Next Month', exact: true })).toHaveAttribute('tabindex', '0');
                await expect(page.getByRole('button', { name: 'September 14, 2026', exact: true })).toBeDisabled();
                await expect(page.locator('.datetimepicker')).not.toHaveClass(/datetimepicker-disabled/);
                await expect(page.locator('#date')).toHaveValue('2026-09-15');
                await expect(page.locator('#date')).not.toHaveAttribute('data-notified');
                expect(await page.evaluate(() => $.isSame(window.selectedCell, $.findOne('[aria-label="September 15, 2026"]')))).toBe(true);
            });
        }

        test('observes nested fieldsets and respects the first legend exemption', async ({ page }) => {
            await page.evaluate(() => {
                $.setHtml(document.body,
                    '<fieldset id="outer"><legend><input id="legend" value="2026-09-15"></legend>' +
                    '<fieldset id="inner"><input id="date" value="2026-09-15"></fieldset></fieldset>',
                );
                $('input').datetimepicker({ inline: true });
                $.setProperty('#outer', 'disabled', true);
            });

            const legendMenu = page.locator('legend .datetimepicker');
            const innerMenu = page.locator('#inner .datetimepicker');

            await expect(innerMenu).toHaveClass(/datetimepicker-disabled/);
            await expect(legendMenu).not.toHaveClass(/datetimepicker-disabled/);
            await expect(legendMenu.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);

            await page.evaluate(() => {
                $.setProperty('#inner', 'disabled', true);
                $.setProperty('#outer', 'disabled', false);
            });

            await expect(innerMenu).toHaveClass(/datetimepicker-disabled/);

            await page.evaluate(() => $.setProperty('#inner', 'disabled', false));

            await expect(innerMenu).not.toHaveClass(/datetimepicker-disabled/);
            await expect(innerMenu.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);
        });

        test('synchronizes both date and time panels without losing their tab stops', async ({ page }) => {
            await page.evaluate(() => {
                $.setValue('#date', '2026-09-15 12:30');
                UI.DateTimePicker.init($.findOne('#date'), {
                    inline: true,
                    sideBySide: true,
                    format: 'yyyy-MM-dd HH:mm',
                });
            });

            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();

            const hour = page.getByRole('button', { name: '14', exact: true });

            await hour.dispatchEvent('mousedown');
            await page.evaluate(() => $.setProperty('#date', 'readOnly', true));

            await expect(hour).toBeDisabled();
            await expect(page.locator('.datetimepicker [tabindex="0"]')).toHaveCount(0);

            await page.evaluate(() => $.setProperty('#date', 'readOnly', false));

            await expect(hour).toHaveAttribute('tabindex', '0');
            await expect(page.locator('[data-ui-hour][tabindex="0"]')).toHaveCount(1);
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toHaveAttribute('tabindex', '0');
            await expect(page.locator('#date')).toHaveValue('2026-09-15 12:30');
        });

        for (const modal of [false, true]) {
            for (const { target, property } of [
                { target: '#date', property: 'disabled' },
                { target: '#date', property: 'readOnly' },
                { target: '#fields', property: 'disabled' },
            ]) {
                test(`closes an open ${modal ? 'modal' : 'popup'} after ${target}.${property} changes`, async ({ page }) => {
                    await page.evaluate((useModal) => UI.DateTimePicker.init($.findOne('#date'), { modal: useModal }).show(), modal);

                    await expect(page.getByRole('dialog')).toBeVisible();

                    if (modal) {
                        await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                    }
                    await page.evaluate(({ target, property }) => $.setProperty(target, property, true), { target, property });

                    await expect(page.getByRole('dialog')).toHaveCount(0);
                    await expect(page.locator('#date')).toHaveAttribute('aria-expanded', 'false');
                    await expect(page.locator('#date')).toHaveValue('2026-09-15');

                    await page.evaluate(({ target, property }) => $.setProperty(target, property, false), { target, property });

                    await expect(page.getByRole('dialog')).toHaveCount(0);

                    await page.evaluate(() => $('#date').datetimepicker('show'));

                    await expect(page.getByRole('dialog')).toBeVisible();
                    await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
                });
            }
        }

        test('keeps an open picker editable when ignoreReadonly is enabled', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { ignoreReadonly: true }).show());
            await page.evaluate(() => $.setProperty('#date', 'readOnly', true));

            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeEnabled();

            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-16');
        });

        for (const ignoreReadonly of [false, true]) {
            test(`honors ignoreReadonly=${ignoreReadonly}`, async ({ page }) => {
                await page.evaluate((ignore) => {
                    $.setProperty($.findOne('#date'), 'readOnly', true);

                    const picker = UI.DateTimePicker.init($.findOne('#date'), { ignoreReadonly: ignore });

                    picker.show();
                    picker.setDate([2026, 10, 16]);
                }, ignoreReadonly);

                await expect(page.locator('.datetimepicker')).toHaveCount(ignoreReadonly ? 1 : 0);
                await expect(page.getByLabel('Appointment')).toHaveValue(ignoreReadonly ? '2026-10-16' : '2026-09-15');
            });
        }
    });

    test.describe('reset', () => {
        for (const multiDate of [false, true]) {
            test(`restores the ${multiDate ? 'multi-date' : 'single-date'} selection and inline view`, async ({ page }) => {
                await page.evaluate((multiple) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        inline: true,
                        multiDate: multiple,
                    });

                    picker.setDate(multiple ? ['2026-10-16', '2026-10-17'] : '2026-10-16');
                    $.findOne('#date').addEventListener('change', (event) => $.setDataset(event.target, 'changed', true));
                }, multiDate);

                await page.getByRole('button', { name: 'Reset', exact: true }).click();

                await expect(page.locator('#date')).toHaveValue('2026-09-15');
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
                await expect(page.locator('#date')).not.toHaveAttribute('data-changed');
            });
        }

        test('leaves canceled resets unchanged', async ({ page }) => {
            await page.evaluate(() => {
                UI.DateTimePicker.init($.findOne('#date'), { inline: true }).setDate('2026-09-16');
                $.findOne('form').addEventListener('reset', (event) => event.preventDefault());
            });

            await page.getByRole('button', { name: 'Reset', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-16');
            await expect(page.getByRole('button', { name: 'September 16, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
        });

        for (const multiDate of [false, true]) {
            for (const listenerOrder of ['before', 'after']) {
                test(`retains an accepted reset when a later reset is canceled (multiDate=${multiDate}, listener=${listenerOrder})`, async ({ page }) => {
                    await page.clock.install({ time: new Date('2026-09-15T12:30:00Z') });
                    await page.clock.pauseAt(new Date('2026-09-15T12:30:01Z'));
                    await page.evaluate(({ multiDate, listenerOrder }) => {
                        const form = $.findOne('#form');
                        let cancel = false;
                        const handler = (event) => {
                            if (cancel) {
                                event.preventDefault();
                            }
                        };
                        if (listenerOrder === 'before') {
                            form.addEventListener('reset', handler);
                        }
                        const picker = UI.DateTimePicker.init($.findOne('#date'), { inline: true, multiDate });
                        picker.setDate(multiDate ? ['2026-10-16', '2026-10-17'] : '2026-10-16');
                        $.addEvent('#date', 'change', (event) => $.setDataset(event.target, 'changed', true));
                        if (listenerOrder === 'after') {
                            form.addEventListener('reset', handler);
                        }
                        form.reset();
                        cancel = true;
                        form.reset();
                    }, { multiDate, listenerOrder });
                    await page.clock.runFor(1);

                    await expect(page.locator('#date')).toHaveValue('2026-09-15');
                    await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
                    await expect(page.locator('#date')).not.toHaveAttribute('data-changed');
                    expect(await page.evaluate((multiple) => {
                        const date = $('#date').datetimepicker('getDate');
                        return multiple ? date.map((value) => value.format('yyyy-MM-dd')) : date.format('yyyy-MM-dd');
                    }, multiDate)).toEqual(multiDate ? ['2026-09-15'] : '2026-09-15');
                });
            }
        }

        test('cancels pending reset work on disposal', async ({ page }) => {
            await page.clock.install();
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { inline: true });

                $.findOne('form').reset();
                picker.dispose();
            });
            await page.clock.runFor(100);

            await expect(page.getByLabel('Appointment')).toBeVisible();
            await expect(page.locator('.datetimepicker')).toHaveCount(0);
        });
    });

    test.describe('disposal', () => {
        test('preserves user handlers and another picker on the same form', async ({ page }) => {
            await page.evaluate(() => {
                $.append('#fields', '<input id="second" value="2026-09-20">');

                const first = UI.DateTimePicker.init($.findOne('#date'));
                const second = UI.DateTimePicker.init($.findOne('#second'), { inline: true });

                first.setDate('2026-09-16');
                second.setDate('2026-09-21');

                window.userEvents = [];
                window.userResets = 0;

                $.addEvent('#date', 'change.ui.datetimepicker input.ui.datetimepicker click.ui.datetimepicker focus.ui.datetimepicker keydown.ui.datetimepicker', (event) => {
                    window.userEvents.push(event.type);
                });
                $.addEvent('#form', 'reset.ui.datetimepicker', () => window.userResets++);

                first.dispose();

                for (const type of ['change', 'input', 'click', 'focus', 'keydown']) {
                    $.triggerEvent('#date', `${type}.ui.datetimepicker`);
                }
            });

            expect(await page.evaluate(() => window.userEvents)).toEqual(['change', 'input', 'click', 'focus', 'keydown']);

            await page.getByRole('button', { name: 'Reset', exact: true }).click();

            await expect(page.locator('#second')).toHaveValue('2026-09-20');
            await expect(page.getByRole('button', { name: 'September 20, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
            expect(await page.evaluate(() => $('#second').datetimepicker('getDate').format('yyyy-MM-dd'))).toBe('2026-09-20');
            expect(await page.evaluate(() => window.userResets)).toBe(1);
        });

        test('disconnects pending and future native state mutations on disposal', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { inline: true });

                window.disposedMenu = $.findOne('.datetimepicker');
                $.setProperty('#date', 'readOnly', true);
                picker.dispose();
                $.setProperty('#fields', 'disabled', true);
            });
            await page.evaluate(() => $.setProperty('#date', 'disabled', true));

            expect(await page.evaluate(() => $.hasClass(window.disposedMenu, 'datetimepicker-disabled'))).toBe(false);
            expect(await page.evaluate(() => $.getAttribute($.findOne('[aria-label="September 15, 2026"]', window.disposedMenu), 'aria-disabled'))).toBe('false');
            await expect(page.locator('.datetimepicker')).toHaveCount(0);
        });
    });
});
