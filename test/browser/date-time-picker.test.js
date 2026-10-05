import { expect, test } from '#test';

test.describe('DateTimePicker', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
            $.setHtml(document.body,
                '<label for="date">Date</label>' +
                '<input id="date" class="input-outline">' +
                '<button id="outside" style="position:absolute;right:0;top:0">Outside</button>',
            );
            Object.assign(UI.DateTimePicker.defaults, {
                duration: 0,
                locale: 'en-GB',
                mobileModal: false,
                timeZone: 'UTC',
            });
        });
    });

    test.describe('#init', () => {
        test('rejects a non-input element', async ({ page }) => {
            expect(await page.evaluate(() => {
                try {
                    UI.DateTimePicker.init($.findOne('#outside'));
                } catch (error) {
                    return error.message;
                }
            })).toBe('DateTimePicker must be created on an input element.');
        });
        test('rejects non-element constructor arguments', async ({ page }) => {
            expect(await page.evaluate(() => {
                const node = $.findOne('#date');
                const argumentsToReject = [null, undefined, '#date', '[', [node], $('#date')];
                return argumentsToReject.map((argument) => {
                    try {
                        new UI.DateTimePicker(argument);
                    } catch (error) {
                        return `${error.name}: ${error.message}`;
                    }
                });
            })).toEqual(Array(6).fill('TypeError: DateTimePicker must be created on an input element.'));
        });
        test('initializes every matched node and returns the first instance (QuerySet)', async ({ page }) => {
            expect(await page.evaluate(() => {
                $.after($.findOne('#date'), '<input id="second">');
                const first = $('input').datetimepicker({ format: 'yyyy-MM-dd' });
                return first === $.getData('#date', 'datetimepicker');
            })).toBe(true);
            expect(await page.evaluate(() => $.getData('#second', 'datetimepicker') instanceof UI.DateTimePicker)).toBe(true);
            await page.evaluate(() => $('input').datetimepicker('setDate', '2026-09-16'));
            await expect(page.locator('#date')).toHaveValue('2026-09-16');
            await expect(page.locator('#second')).toHaveValue('2026-09-16');
            expect(await page.evaluate(() => $('input').datetimepicker('getDate').format('yyyy-MM-dd'))).toBe('2026-09-16');
        });

        for (const { name, init } of [
            { name: 'class', init: () => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }) },
            { name: 'QuerySet', init: () => $('#date').datetimepicker({ format: 'yyyy-MM-dd' }) },
        ]) {
            test(`creates and registers a DateTimePicker (${name})`, async ({ page }) => {
                await page.getByLabel('Date', { exact: true }).fill('2026-09-15');
                const instance = await page.evaluateHandle(init);
                expect(await instance.evaluate((value) => value instanceof UI.DateTimePicker)).toBe(true);
                expect(await instance.evaluate((value) => $.getData('#date', 'datetimepicker') === value)).toBe(true);
                expect(await instance.evaluate((value) => value.node === $.findOne('#date'))).toBe(true);
                expect(await instance.evaluate((value) => Object.isFrozen(value.options))).toBe(true);
                expect(await instance.evaluate((value) => value.getDate().format('yyyy-MM-dd'))).toBe('2026-09-15');
                await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15');
            });
        }

        test('reuses the instance and gives explicit options precedence over data attributes', async ({ page }) => {
            expect(await page.evaluate(() => {
                const node = $.findOne('#date');
                $.setDataset(node, 'uiFormat', 'MM/yyyy');
                const first = UI.DateTimePicker.init(node, { format: 'yyyy-MM-dd' });
                first.setDate([2026, 9, 15]);
                return first === UI.DateTimePicker.init(node, { format: 'yyyy' });
            })).toBe(true);
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15');
        });

        test('derives format and inline mode without mutating frozen options', async ({ page }) => {
            const instance = await page.evaluateHandle(() => {
                const node = $.findOne('#date');
                $.setDataset(node, 'uiInline', true);
                return UI.DateTimePicker.init(node, { modal: true, multiDate: true });
            });
            expect(await instance.evaluate((value) => value.options.format)).toBeNull();
            expect(await instance.evaluate((value) => value.options.modal)).toBe(true);
            await expect(page.locator('.datetimepicker-inline')).toBeVisible();
            await expect(page.locator('.modal')).toHaveCount(0);
        });

        test('parses string bounds after resolving the default format', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                inline: true,
                multiDate: true,
                minDate: '14/09/2026',
                maxDate: '16/09/2026',
            }));
            await expect(page.getByRole('button', { name: 'September 13, 2026', exact: true })).toHaveAttribute('aria-disabled', 'true');
            await expect(page.getByRole('button', { name: 'September 17, 2026', exact: true })).toHaveAttribute('aria-disabled', 'true');
            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('15/09/2026');
        });

        test('accepts epoch zero as a bound and default view', async ({ page }) => {
            const instance = await page.evaluateHandle(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd', defaultDate: 0, minDate: 0, maxDate: 0,
            }));
            expect(await instance.evaluate((value) => value.getMinDate().getTimestamp())).toBe(0);
            expect(await instance.evaluate((value) => value.getMaxDate().getTimestamp())).toBe(0);
            expect(await instance.evaluate((value) => value.getViewDate().getTimestamp())).toBe(0);
        });

        test('uses the current date deterministically', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm', useCurrent: true,
            }));
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15 12:30');
        });

        for (const step of [0, -1, 61, 1.5, NaN, Infinity, '5']) {
            test(`rejects invalid minuteStepping ${step} without registering an instance`, async ({ page }) => {
                expect(await page.evaluate((minuteStepping) => {
                    try {
                        UI.DateTimePicker.init($.findOne('#date'), { minuteStepping });
                    } catch (error) {
                        return error.message;
                    }
                }, step)).toBe('minuteStepping must be an integer between 1 and 60.');
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
                await expect(page.locator('.datetimepicker')).toHaveCount(0);
            });
        }

        for (const callback of ['isValidDay', 'renderDay']) {
            test(`cleans up after ${callback} throws during initialization`, async ({ page }) => {
                expect(await page.evaluate((name) => {
                    try {
                        UI.DateTimePicker.init($.findOne('#date'), {
                            format: 'yyyy-MM-dd', inline: true, useCurrent: true,
                            [name]: () => {
                                throw new Error('Callback failed');
                            },
                        });
                    } catch (error) {
                        return error.message;
                    }
                }, callback)).toBe('Callback failed');
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
                await expect(page.locator('.datetimepicker')).toHaveCount(0);
                await expect(page.getByLabel('Date', { exact: true })).toBeVisible();
                await expect(page.getByLabel('Date', { exact: true })).not.toHaveAttribute('aria-controls');
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true }).setDate('2026-09-16'));
                await expect(page.getByRole('button', { name: 'September 16, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
            });
        }

        test('cleans up registration after an unsupported format', async ({ page }) => {
            expect(await page.evaluate(() => {
                try {
                    UI.DateTimePicker.init($.findOne('#date'), { format: 'dd' });
                } catch (error) {
                    return error.message;
                }
            })).toBe('Date selector requires a month.');
            expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
        });
    });

    test.describe('#dispose', () => {
        for (const { callback, format } of [
            { callback: 'isValidYear', format: 'yyyy' },
            { callback: 'isValidMonth', format: 'yyyy-MM' },
            { callback: 'isValidDay', format: 'yyyy-MM-dd' },
            { callback: 'isValidTime', format: 'HH:mm' },
            { callback: 'renderDay', format: 'yyyy-MM-dd' },
            { callback: 'renderMonth', format: 'yyyy-MM' },
            { callback: 'renderYear', format: 'yyyy' },
        ]) {
            test(`permits disposal from ${callback} during initialization`, async ({ page }) => {
                await page.evaluate(({ name, pattern }) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: pattern, inline: true, useCurrent: true,
                    [name]: () => {
                        $.getData('#date', 'datetimepicker').dispose();
                        return true;
                    },
                }), { name: callback, pattern: format });
                await expect(page.locator('.datetimepicker')).toHaveCount(0);
                await expect(page.getByLabel('Date', { exact: true })).toBeVisible();
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
            });
        }
        for (const { name, dispose } of [
            { name: 'class', dispose: () => UI.DateTimePicker.init($.findOne('#date')).dispose() },
            { name: 'QuerySet', dispose: () => $('#date').datetimepicker('dispose') },
        ]) {
            test(`unregisters and permits reinitialization (${name})`, async ({ page }) => {
                const instance = await page.evaluateHandle(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }));
                await page.evaluate(dispose);
                expect(await instance.evaluate((value) => value.node)).toBeNull();
                expect(await instance.evaluate((value) => value.options)).toBeNull();
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
                await expect(page.getByLabel('Date', { exact: true })).toBeVisible();
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).setDate([2026, 9, 16]));
                await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-16');
            });
        }
    });

    test.describe('#clear', () => {
        for (const multiDate of [false, true]) {
            test(`clears a ${multiDate ? 'multi' : 'single'}-date selection`, async ({ page }) => {
                const instance = await page.evaluateHandle((multiple) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', multiDate: multiple });
                    picker.setDate(multiple ? ['2026-09-15', '2026-09-16'] : '2026-09-15');
                    return picker;
                }, multiDate);
                await expect(page.getByLabel('Date', { exact: true })).not.toHaveValue('');
                await instance.evaluate((value) => value.clear());
                await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
                if (multiDate) {
                    expect(await instance.evaluate((value) => value.getDate().length)).toBe(0);
                } else {
                    expect(await instance.evaluate((value) => value.getDate())).toBeNull();
                }
            });
        }
    });

    for (const method of ['disable', 'enable']) {
        test.describe(`#${method}`, () => {
            test('updates the input and inline calendar', async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true });
                    picker.disable();
                    picker[name]();
                }, method);
                if (method === 'disable') {
                    await expect(page.locator('#date')).toBeDisabled();
                    await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeDisabled();
                } else {
                    await expect(page.locator('#date')).toBeEnabled();
                    await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeEnabled();
                }
            });
        });
    }

    test.describe('#getDate', () => {
        test('returns a copy of the multi-date selection', async ({ page }) => {
            expect(await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', multiDate: true });
                picker.setDate(['2026-09-15']);
                picker.getDate().pop();
                return picker.getDate().length;
            })).toBe(1);
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15');
        });
    });

    test.describe('#getViewDate', () => {
        test('returns the date reached by calendar navigation', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true }));
            await page.getByRole('button', { name: 'Next Month', exact: true }).click();
            expect(await page.evaluate(() => $('#date').datetimepicker('getViewDate').format('yyyy-MM-dd'))).toBe('2026-10-15');
        });
    });

    for (const bound of ['Min', 'Max']) {
        test.describe(`#get${bound}Date`, () => {
            test('returns the configured bound', async ({ page }) => {
                expect(await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd', minDate: '2026-09-01', maxDate: '2026-09-30',
                    });
                    return picker[`get${name}Date`]().format('yyyy-MM-dd');
                }, bound)).toBe(bound === 'Min' ? '2026-09-01' : '2026-09-30');
            });
        });
    }

    test.describe('#setDate', () => {
        for (const { name, makeDate } of [
            { name: 'string', makeDate: () => '2026-09-16' },
            { name: 'tuple', makeDate: () => [2026, 9, 16] },
            { name: 'Date', makeDate: () => new Date('2026-09-16T00:00:00Z') },
            { name: 'DateTime', makeDate: () => DateTime.fromArray([2026, 9, 16], { timeZone: 'UTC' }) },
        ]) {
            test(`accepts a ${name}`, async ({ page }) => {
                const date = await page.evaluateHandle(makeDate);
                await page.evaluate((value) => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).setDate(value), date);
                await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-16');
            });
        }

        test('preserves epoch zero', async ({ page }) => {
            await page.evaluate(() => $('#date').datetimepicker({ format: 'yyyy-MM-dd HH:mm' }).setDate(0));
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('1970-01-01 00:00');
        });

        test('parses alternate formats and normalizes the input', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd', altFormats: ['dd/MM/yyyy'],
            }).setDate('16/09/2026'));
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-16');
        });

        for (const { name, makeDate } of [
            { name: 'invalid DateTime', makeDate: () => DateTime.fromFormat('yyyy-MM-dd', '2026-02-31') },
            { name: 'invalid Date', makeDate: () => new Date(NaN) },
            { name: 'non-finite timestamp', makeDate: () => Infinity },
            { name: 'invalid tuple', makeDate: () => [2026, NaN, 15] },
        ]) {
            test(`clears an ${name}`, async ({ page }) => {
                const date = await page.evaluateHandle(makeDate);
                await page.evaluate((value) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });
                    picker.setDate('2026-09-15');
                    picker.setDate(value);
                }, date);
                await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
                expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
            });
        }

        test('sorts multi-date values, filters invalid input, and clears with an empty array', async ({ page }) => {
            const instance = await page.evaluateHandle(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', multiDate: true });
                picker.setDate(['2026-09-16', 'invalid', '2026-09-15']);
                return picker;
            });
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15,2026-09-16');
            await instance.evaluate((value) => value.setDate([]));
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
        });

        test('rejects a scalar multi-date selection without changing the input', async ({ page }) => {
            expect(await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', multiDate: true });
                picker.setDate(['2026-09-15']);
                try {
                    picker.setDate('2026-09-16');
                } catch (error) {
                    return error.message;
                }
            })).toBe('multiDate requires an array of dates or null.');
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15');
        });
    });

    for (const bound of ['Min', 'Max']) {
        test.describe(`#set${bound}Date`, () => {
            test('updates bounds, revalidates the value, and permits clearing the bound', async ({ page }) => {
                const instance = await page.evaluateHandle(() => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true });
                    picker.setDate('2026-09-15');
                    return picker;
                });
                await instance.evaluate((picker, name) => picker[`set${name}Date`](name === 'Min' ? '2026-09-16' : '2026-09-14'), bound);
                await expect(page.locator('#date')).toHaveValue('');
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeDisabled();
                await instance.evaluate((picker, name) => picker[`set${name}Date`](null), bound);
                expect(await instance.evaluate((picker, name) => picker[`get${name}Date`](), bound)).toBeNull();
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeEnabled();
            });
        });
    }

    test.describe('#refresh', () => {
        for (const api of ['class', 'QuerySet']) {
            test(`revalidates a selection after callback rules change (${api})`, async ({ page }) => {
                await page.evaluate(() => {
                    window.allowed = true;
                    UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd', inline: true, isValidDay: () => window.allowed,
                    }).setDate('2026-09-15');
                });
                await expect(page.locator('#date')).toHaveValue('2026-09-15');
                await page.evaluate((name) => {
                    window.allowed = false;
                    if (name === 'class') {
                        UI.DateTimePicker.init($.findOne('#date')).refresh();
                    } else {
                        $('#date').datetimepicker('refresh');
                    }
                }, api);
                await expect(page.locator('#date')).toHaveValue('');
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeDisabled();
            });
        }
    });

    test.describe('#show', () => {
        test('renders the popup with current UI and DateTime', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show());
            await expect(page.locator('.datetimepicker')).toBeVisible();
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeVisible();
        });

        test('renders a UI 4 modal', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true }).show());
            await expect(page.locator('.modal')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Set', exact: true })).toBeVisible();
        });
    });

    test.describe('#hide', () => {
        test('closes the popup and clears expanded state', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show());
            await expect(page.getByRole('dialog')).toBeVisible();
            await page.evaluate(() => $('#date').datetimepicker('hide'));
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Date', { exact: true })).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test.describe('#toggle', () => {
        test('toggles through QuerySet', async ({ page }) => {
            await page.evaluate(() => $('#date').datetimepicker({ format: 'yyyy-MM-dd' }).toggle());
            await expect(page.getByRole('dialog')).toBeVisible();
            await page.evaluate(() => $('#date').datetimepicker('toggle'));
            await expect(page.getByRole('dialog')).toHaveCount(0);
        });
    });

    test.describe('#update', () => {
        test('updates an open Popper and is harmless while closed', async ({ page }) => {
            await page.evaluate(() => {
                const picker = $('#date').datetimepicker({ format: 'yyyy-MM-dd' });
                picker.update();
                picker.show();
                picker.update();
            });
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('dialog')).toHaveCSS('position', 'absolute');
        });
    });

    test.describe('events', () => {
        test('emits lifecycle events in order', async ({ page }) => {
            await page.evaluate(() => {
                window.events = [];
                for (const name of ['show', 'shown', 'hide', 'hidden']) {
                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => window.events.push(name));
                }
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show();
            });
            await expect.poll(() => page.evaluate(() => window.events.join(','))).toBe('show,shown');
            await page.evaluate(() => $('#date').datetimepicker('hide'));
            await expect.poll(() => page.evaluate(() => window.events.join(','))).toBe('show,shown,hide,hidden');
        });

        test('ignores interrupted popup animations and permits reopening', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await page.clock.install();
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', duration: 100 });
                window.shown = 0;
                window.hidden = 0;
                $.addEvent('#date', 'shown.ui.datetimepicker', () => window.shown++);
                $.addEvent('#date', 'hidden.ui.datetimepicker', () => window.hidden++);
                picker.show();
                picker.hide();
                picker.show();
            });
            await page.clock.runFor(300);
            await expect(page.getByRole('dialog')).toBeVisible();
            expect(await page.evaluate(() => window.shown)).toBe(1);
            expect(await page.evaluate(() => window.hidden)).toBe(0);
            await page.evaluate(() => $('#date').datetimepicker('hide'));
            await page.clock.runFor(300);
            await expect(page.getByRole('dialog')).toHaveCount(0);
            expect(await page.evaluate(() => window.hidden)).toBe(1);
        });

        test('can be disposed during an animated panel switch', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await page.clock.install();
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd HH:mm', inline: true, duration: 100 });
                $.click('[data-ui-action="showTime"]');
                picker.dispose();
            });
            await page.clock.runFor(300);
            await expect(page.locator('.datetimepicker')).toHaveCount(0);
            await expect(page.getByLabel('Date', { exact: true })).toBeVisible();
        });

        test('reports selection changes once and suppresses unchanged values', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });
                picker.setDate('2026-09-15');
                window.changes = 0;
                $.addEvent('#date', 'change.ui.datetimepicker', (event) => {
                    window.changes++;
                    window.oldDate = event.detail.old?.format('yyyy-MM-dd');
                    window.newDate = event.detail.new?.format('yyyy-MM-dd');
                });
                picker.setDate('2026-09-16');
                picker.setDate('2026-09-16');
            });
            expect(await page.evaluate(() => window.changes)).toBe(1);
            expect(await page.evaluate(() => window.oldDate)).toBe('2026-09-15');
            expect(await page.evaluate(() => window.newDate)).toBe('2026-09-16');
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-16');
        });

        for (const event of ['show', 'hide']) {
            test(`allows canceling ${event}`, async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });
                    if (name === 'hide') {
                        picker.show();
                    }
                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => false);
                    picker[name]();
                }, event);
                await expect(page.getByRole('dialog')).toHaveCount(event === 'hide' ? 1 : 0);
                await expect(page.getByLabel('Date', { exact: true })).toHaveAttribute('aria-expanded', event === 'hide' ? 'true' : 'false');
            });
        }

        for (const event of ['show', 'shown', 'hide', 'hidden', 'change', 'refresh']) {
            test(`permits disposal from ${event}`, async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });
                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => picker.dispose());
                    if (name === 'change') {
                        picker.setDate('2026-09-16');
                    } else {
                        picker.show();
                    }
                }, event);
                if (['hide', 'hidden'].includes(event)) {
                    await expect(page.getByRole('dialog')).toBeVisible();
                    await page.evaluate(() => $('#date').datetimepicker('hide'));
                }
                await expect(page.getByRole('dialog')).toHaveCount(0);
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
            });
        }

        test('does not re-enter show from its own event', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });
                $.addEvent('#date', 'show.ui.datetimepicker', () => picker.show());
                picker.show();
            });
            await expect(page.getByRole('dialog')).toHaveCount(1);
        });

        for (const multiDate of [false, true]) {
            test(`renders a ${multiDate ? 'multi-date' : 'single-date'} selection changed from a refresh callback`, async ({ page }) => {
                await page.evaluate((multiple) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true, multiDate: multiple });
                    window.refreshes = 0;
                    $.addEvent('#date', 'refresh.ui.datetimepicker', () => {
                        window.refreshes++;
                        picker.setDate(multiple ? ['2026-09-17'] : '2026-09-17');
                    });
                    picker.setDate(multiple ? ['2026-09-16'] : '2026-09-16');
                }, multiDate);
                await expect(page.locator('#date')).toHaveValue('2026-09-17');
                await expect(page.getByRole('button', { name: 'September 17, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
                await expect(page.getByRole('button', { name: 'September 16, 2026', exact: true })).toHaveAttribute('aria-pressed', 'false');
                expect(await page.evaluate(() => window.refreshes)).toBe(1);
            });
        }

        test('renders a time changed from a refresh callback without recursive events', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'HH:mm', inline: true });
                window.refreshes = 0;
                $.addEvent('#date', 'refresh.ui.datetimepicker', () => {
                    window.refreshes++;
                    picker.setDate('15:10');
                });
                picker.setDate('14:45');
            });
            await expect(page.locator('#date')).toHaveValue('15:10');
            await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toHaveText('15');
            await expect(page.getByRole('button', { name: 'Select Minute', exact: true })).toHaveText('10');
            expect(await page.evaluate(() => window.refreshes)).toBe(1);
        });

        test('reports refresh view details', async ({ page }) => {
            await page.evaluate(() => {
                $.addEvent('#date', 'refresh.ui.datetimepicker', (event) => {
                    $.setDataset(event.target, 'view', event.detail.view);
                    $.setDataset(event.target, 'mode', event.detail.viewMode);
                });
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true });
            });
            await expect(page.locator('#date')).toHaveAttribute('data-view', 'date');
            await expect(page.locator('#date')).toHaveAttribute('data-mode', 'days');
        });
    });

    test.describe('user events', () => {
        for (const sideBySide of [false, true]) {
            test(`selects a date and moves focus to time controls (sideBySide=${sideBySide})`, async ({ page }) => {
                await page.evaluate((side) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd HH:mm', inline: true, sideBySide: side,
                    isValidTime: (date) => date.getHours() === 10 && date.getMinutes() === 17,
                }), sideBySide);
                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                await expect(page.locator('#date')).toHaveValue('2026-09-16 10:17');
                await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toBeFocused();
            });
        }

        test('leaves the selection unchanged when a date has no valid times', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm', inline: true, isValidTime: (date) => date.getDate() === 15,
            }).setDate('2026-09-15 12:30'));
            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('2026-09-15 12:30');
        });

        test('clamps a selected day to its inclusive time bounds', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm', inline: true, sideBySide: true,
                minDate: '2026-09-16 14:00', maxDate: '2026-09-17 09:00',
            }));
            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('2026-09-16 14:00');
            await page.getByRole('button', { name: 'September 17, 2026', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('2026-09-17 09:00');
        });

        test('keeps keyboard navigation within calendar bounds', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd', inline: true, minDate: '2026-09-15', maxDate: '2026-09-15',
            }));
            const day = page.getByRole('button', { name: 'September 15, 2026', exact: true });
            await day.focus();
            await page.keyboard.press('ArrowRight');
            await expect(day).toBeFocused();
            await page.keyboard.press('ArrowLeft');
            await expect(day).toBeFocused();
        });
        test('moves between the input and calendar with Tab and Shift+Tab', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }));
            await page.getByLabel('Date', { exact: true }).focus();
            await page.keyboard.press('Tab');
            await expect(page.getByRole('button', { name: 'Previous Month', exact: true })).toBeFocused();
            await page.keyboard.press('Shift+Tab');
            await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
            await page.keyboard.press('Shift+Tab');
            await expect(page.getByRole('dialog')).toHaveCount(0);
        });

        test('dismisses Escape from a focused date and restores input focus', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show());
            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).focus();
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
        });

        test('navigates and selects a calendar date', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true }));
            await page.getByRole('button', { name: 'Next Month', exact: true }).click();
            await page.getByRole('button', { name: 'October 16, 2026', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('2026-10-16');
        });

        test('selects hours and minutes with DateTime 8 methods', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'HH:mm', inline: true, minuteStepping: 5 }));
            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
            await page.getByRole('button', { name: '14', exact: true }).click();
            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();
            await page.getByRole('button', { name: '35', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('14:35');
        });

        test('dismisses on outside interaction and Escape', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }));
            await page.getByLabel('Date', { exact: true }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
            await page.getByRole('button', { name: 'Outside', exact: true }).click();
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await page.getByLabel('Date', { exact: true }).click();
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
        });

        test.describe('keyboard', () => {
            for (const { key, date } of [
                { key: 'ArrowRight', date: 'September 16, 2026' },
                { key: 'ArrowLeft', date: 'September 14, 2026' },
                { key: 'ArrowUp', date: 'September 8, 2026' },
                { key: 'ArrowDown', date: 'September 22, 2026' },
                { key: 'Home', date: 'September 14, 2026' },
                { key: 'End', date: 'September 20, 2026' },
                { key: 'PageUp', date: 'August 15, 2026' },
                { key: 'PageDown', date: 'October 15, 2026' },
                { key: 'Control+ArrowLeft', date: 'August 15, 2026' },
                { key: 'Control+ArrowRight', date: 'October 15, 2026' },
                { key: 'Control+ArrowUp', date: 'September 15, 2025' },
                { key: 'Control+ArrowDown', date: 'September 15, 2027' },
            ]) {
                test(`moves date focus with ${key}`, async ({ page }) => {
                    await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true }));
                    await page.getByRole('button', { name: 'September 15, 2026', exact: true }).focus();
                    await page.keyboard.press(key);
                    await expect(page.getByRole('button', { name: date, exact: true })).toBeFocused();
                    await expect(page.getByRole('button', { name: date, exact: true })).toHaveAttribute('tabindex', '0');
                });
            }

            test('selects with Space and preserves a single tab stop among dates', async ({ page }) => {
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true }));
                await page.getByRole('button', { name: 'September 15, 2026', exact: true }).focus();
                await page.keyboard.press('ArrowRight');
                await page.keyboard.press('Space');
                await expect(page.locator('#date')).toHaveValue('2026-09-16');
                await expect(page.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);
            });
        });
        test.describe('calendar views', () => {
            test('navigates decades, years, months, and days', async ({ page }) => {
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true }));
                await page.getByRole('button', { name: 'Select Month', exact: true }).click();
                await page.getByRole('button', { name: 'Next Year', exact: true }).click();
                await page.getByRole('button', { name: 'Previous Year', exact: true }).click();
                await page.getByRole('button', { name: 'Select Year', exact: true }).click();
                await page.getByRole('button', { name: 'Next Decade', exact: true }).click();
                await expect(page.getByRole('button', { name: '2036', exact: true })).toBeVisible();
                await page.getByRole('button', { name: 'Previous Decade', exact: true }).click();
                await page.getByRole('button', { name: '2027', exact: true }).click();
                await page.getByRole('button', { name: 'Oct', exact: true }).click();
                await page.getByRole('button', { name: 'Previous Month', exact: true }).click();
                await page.getByRole('button', { name: 'September 17, 2027', exact: true }).click();
                await expect(page.locator('#date')).toHaveValue('2027-09-17');
            });

            for (const { format, start, direction, target } of [
                { format: 'yyyy-MM', start: 'Sept', direction: 'ArrowLeft', target: 'Aug' },
                { format: 'yyyy-MM', start: 'Sept', direction: 'ArrowRight', target: 'Oct' },
                { format: 'yyyy-MM', start: 'Sept', direction: 'ArrowUp', target: 'Jun' },
                { format: 'yyyy-MM', start: 'Sept', direction: 'ArrowDown', target: 'Dec' },
                { format: 'yyyy', start: '2026', direction: 'ArrowLeft', target: '2025' },
                { format: 'yyyy', start: '2026', direction: 'ArrowRight', target: '2027' },
                { format: 'yyyy', start: '2026', direction: 'ArrowUp', target: '2023' },
                { format: 'yyyy', start: '2026', direction: 'ArrowDown', target: '2029' },
            ]) {
                test(`navigates ${format} with ${direction}`, async ({ page }) => {
                    await page.evaluate((pattern) => UI.DateTimePicker.init($.findOne('#date'), { format: pattern, inline: true }), format);
                    await page.getByRole('button', { name: start, exact: true }).focus();
                    await page.keyboard.press(direction);
                    await expect(page.getByRole('button', { name: target, exact: true })).toBeFocused();
                    await page.keyboard.press('Enter');
                    await expect(page.locator('#date')).not.toHaveValue('');
                });
            }

            for (const keepOpen of [false, true]) {
                test(`selects from a popup with keepOpen=${keepOpen}`, async ({ page }) => {
                    await page.evaluate((keep) => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', keepOpen: keep }), keepOpen);
                    await page.getByLabel('Date', { exact: true }).click();
                    await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                    await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-16');
                    await expect(page.getByRole('dialog')).toHaveCount(keepOpen ? 1 : 0);
                    if (!keepOpen) {
                        await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
                    }
                });
            }
        });

        test.describe('time controls', () => {
            for (const { control, expected } of [
                { control: 'Increment Hour', expected: '13:30' },
                { control: 'Decrement Hour', expected: '11:30' },
                { control: 'Increment Minute', expected: '12:35' },
                { control: 'Decrement Minute', expected: '12:25' },
            ]) {
                test(`changes time through ${control}`, async ({ page }) => {
                    await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'HH:mm', inline: true, minuteStepping: 5 }).setDate('12:30'));
                    await page.getByRole('button', { name: control, exact: true }).click();
                    await expect(page.locator('#date')).toHaveValue(expected);
                });
            }

            for (const { control, key, expected } of [
                { control: 'Select Hour', key: 'ArrowUp', expected: '13:30' },
                { control: 'Select Hour', key: 'ArrowDown', expected: '11:30' },
                { control: 'Select Minute', key: 'ArrowUp', expected: '12:35' },
                { control: 'Select Minute', key: 'ArrowDown', expected: '12:25' },
            ]) {
                test(`changes ${control} with ${key}`, async ({ page }) => {
                    await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'HH:mm', inline: true, minuteStepping: 5 }).setDate('12:30'));
                    await page.getByRole('button', { name: control, exact: true }).press(key);
                    await expect(page.locator('#date')).toHaveValue(expected);
                    await expect(page.getByRole('button', { name: control, exact: true })).toBeFocused();
                });
            }

            test('toggles the period by mouse and keyboard', async ({ page }) => {
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'hh:mm a', inline: true }).setDate('10:30 am'));
                await page.getByRole('button', { name: 'Toggle Period', exact: true }).click();
                await expect(page.locator('#date')).toHaveValue('10:30 pm');
                await page.getByRole('button', { name: 'Toggle Period', exact: true }).press('ArrowUp');
                await expect(page.locator('#date')).toHaveValue('10:30 am');
                await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
                await page.getByRole('button', { name: '11', exact: true }).press('Space');
                await expect(page.locator('#date')).toHaveValue('11:30 am');
            });

            for (const { view, first, target, key, expected } of [
                { view: 'Hour', first: '12', target: '13', key: 'ArrowRight', expected: '13:30' },
                { view: 'Hour', first: '12', target: '11', key: 'ArrowLeft', expected: '11:30' },
                { view: 'Hour', first: '12', target: '08', key: 'ArrowUp', expected: '08:30' },
                { view: 'Hour', first: '12', target: '16', key: 'ArrowDown', expected: '16:30' },
                { view: 'Minute', first: '30', target: '35', key: 'ArrowRight', expected: '12:35' },
            ]) {
                test(`navigates the ${view} grid with ${key}`, async ({ page }) => {
                    await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'HH:mm', inline: true, minuteStepping: 5 }).setDate('12:30'));
                    await page.getByRole('button', { name: `Select ${view}`, exact: true }).click();
                    await expect(page.getByRole('button', { name: first, exact: true })).toBeFocused();
                    await page.keyboard.press(key);
                    await expect(page.getByRole('button', { name: target, exact: true })).toBeFocused();
                    await page.keyboard.press('Enter');
                    await expect(page.locator('#date')).toHaveValue(expected);
                });
            }
        });

        test.describe('panels and toolbar', () => {
            test('switches date/time panels and updates the toolbar', async ({ page }) => {
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd HH:mm', inline: true, showToolbar: true }).setDate('2026-09-15 12:30'));
                await expect(page.locator('.datetimepicker .fs-3').first()).toHaveText('Sept 15');
                await page.getByRole('button', { name: 'Select Time', exact: true }).click();
                await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toBeVisible();
                await page.getByRole('button', { name: 'Increment Minute', exact: true }).click();
                await expect(page.locator('.datetimepicker .fs-3').last()).toHaveText('12:31');
                await page.getByRole('button', { name: 'Select Date', exact: true }).click();
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeVisible();
            });

            for (const format of ['yyyy-MM-dd', 'HH:mm']) {
                test(`closes ${format} with its Close control`, async ({ page }) => {
                    await page.evaluate((pattern) => UI.DateTimePicker.init($.findOne('#date'), { format: pattern, showClose: true }).show(), format);
                    await page.getByRole('button', { name: 'Close', exact: true }).click();
                    await expect(page.getByRole('dialog')).toHaveCount(0);
                    await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
                });
            }
        });
    });

    test.describe('multiDate option', () => {
        test('normalizes typed dates using a custom separator', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd', multiDate: true, multiDateSeparator: ';',
            }));
            await page.getByLabel('Date', { exact: true }).fill('2026-09-16;2026-09-15;2026-09-16');
            await page.getByRole('button', { name: 'Outside', exact: true }).click();
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15;2026-09-16');
        });
        for (const { format, values, expected, button } of [
            { format: 'yyyy-MM-dd', values: [[2026, 9, 15, 10], [2026, 9, 15, 12]], expected: '2026-09-15', button: 'September 15, 2026' },
            { format: 'yyyy-MM', values: [[2026, 9, 2], [2026, 9, 25]], expected: '2026-09', button: 'Sept' },
            { format: 'yyyy', values: [[2026, 1, 2], [2026, 9, 25]], expected: '2026', button: '2026' },
        ]) {
            test(`deduplicates and toggles values at ${format} precision`, async ({ page }) => {
                await page.evaluate(({ pattern, dates }) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: pattern, multiDate: true, inline: true });
                    picker.setDate(dates);
                }, { pattern: format, dates: values });
                await expect(page.locator('#date')).toHaveValue(expected);
                await page.getByRole('button', { name: button, exact: true }).click();
                await expect(page.locator('#date')).toHaveValue('');
            });
        }
    });

    test.describe('keepInvalid option', () => {
        for (const keepInvalid of [false, true]) {
            test(`handles invalid text with keepInvalid=${keepInvalid}`, async ({ page }) => {
                await page.evaluate((keep) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', keepInvalid: keep });
                    picker.setDate('2026-09-15');
                }, keepInvalid);
                await page.getByLabel('Date', { exact: true }).fill('not a date');
                await page.getByRole('button', { name: 'Outside', exact: true }).click();
                await expect(page.getByLabel('Date', { exact: true })).toHaveValue(keepInvalid ? 'not a date' : '2026-09-15');
                if (keepInvalid) {
                    expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
                }
            });
        }
    });

    test.describe('minuteStepping option', () => {
        test('displays selectable minute intervals and disabled time choices', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm', inline: true, minuteStepping: 15, isValidTime: (date) => date.getMinutes() !== 15,
            }).setDate('12:30'));
            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();
            await expect(page.locator('[data-ui-minute]')).toHaveCount(3);
            await expect(page.getByRole('button', { name: '15', exact: true })).toBeDisabled();
            await page.getByRole('button', { name: '45', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('12:45');
        });
        test('rounds across an hour boundary', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'HH:mm', minuteStepping: 5 }).setDate('12:59'));
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('13:00');
        });
    });

    test.describe('format option', () => {
        for (const { format, locale, period } of [
            { format: 'HH:mm', locale: 'en-US', period: false },
            { format: 'hh:mm a', locale: 'en-GB', period: true },
        ]) {
            test(`respects explicit ${format} in ${locale}`, async ({ page }) => {
                await page.evaluate((options) => UI.DateTimePicker.init($.findOne('#date'), { ...options, inline: true }), { format, locale });
                await expect(page.getByRole('button', { name: 'Toggle Period', exact: true })).toHaveCount(period ? 1 : 0);
            });
        }
    });

    for (const { callback, format, label } of [
        { callback: 'renderDay', format: 'yyyy-MM-dd', label: 'September 15, 2026' },
        { callback: 'renderMonth', format: 'yyyy-MM', label: 'Sept' },
        { callback: 'renderYear', format: 'yyyy', label: '2026' },
    ]) {
        test.describe(`${callback} option`, () => {
            test('customizes selectable cells', async ({ page }) => {
                await page.evaluate(({ name, pattern }) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: pattern, inline: true,
                    [name]: (date, node) => {
                        $.addClass(node, 'custom-date');
                        $.setProperty(node, 'title', date.format('yyyy-MM-dd'));
                    },
                }), { name: callback, pattern: format });
                const cell = page.getByRole('button', { name: label, exact: true });
                await expect(cell).toHaveClass(/custom-date/);
                await expect(cell).toHaveAttribute('title', /2026-/);
                await cell.click();
                await expect(page.locator('#date')).not.toHaveValue('');
            });
        });
    }

    test.describe('defaultView option', () => {
        for (const { view, label } of [{ view: 'months', label: 'Sept' }, { view: 'years', label: '2026' }]) {
            test(`opens on ${view} without selecting a date`, async ({ page }) => {
                await page.evaluate((defaultView) => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', defaultView }).show(), view);
                await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
                await expect(page.locator('#date')).toHaveValue('');
            });
        }
    });

    test.describe('mobileModal option', () => {
        test('opens a modal on supported mobile user agents', async ({ page }) => {
            await page.evaluate(() => {
                Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'iPhone' });
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', mobileModal: true });
            });
            await page.getByLabel('Date', { exact: true }).click();
            await expect(page.getByRole('dialog', { name: 'Select Date', exact: true })).toHaveAttribute('aria-modal', 'true');
        });
    });

    test.describe('showToolbar option', () => {
        for (const { format, value, expected } of [
            { format: 'yyyy-MM', value: '2026-09', expected: 'Sept' },
            { format: 'yyyy', value: '2026', expected: '2026' },
            { format: 'HH:mm', value: '14:30', expected: '14:30' },
        ]) {
            test(`updates and clears the ${format} toolbar`, async ({ page }) => {
                await page.evaluate(({ pattern, date }) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: pattern, inline: true, showToolbar: true,
                }).setDate(date), { pattern: format, date: value });
                await expect(page.locator('.datetimepicker > .p-3')).toContainText(expected);
                await page.evaluate(() => $('#date').datetimepicker('clear'));
                await expect(page.locator('.datetimepicker > .p-3')).toContainText('-');
                await expect(page.locator('#date')).toHaveValue('');
            });
        }
    });
});
