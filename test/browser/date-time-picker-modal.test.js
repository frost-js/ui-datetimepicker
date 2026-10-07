import { expect, test } from '#test';

test.describe('DateTimePicker modal', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
            $.setHtml(document.body, '<label for="date">Appointment</label><input id="date" value="2026-09-15">');
        });
    });

    test.describe('commit and cancellation', () => {
        for (const multiDate of [false, true]) {
            test(`commits a ${multiDate ? 'multi-date' : 'single-date'} draft once with correct old and new dates`, async ({ page }) => {
                await page.evaluate((multiple) => {
                    UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true, multiDate: multiple });
                    $.addEvent('#date', 'change.ui.datetimepicker', (event) => {
                        const format = (date) => {
                            if (Array.isArray(date)) {
                                return date.map((value) => value.format('yyyy-MM-dd')).join(',');
                            }

                            return date?.format('yyyy-MM-dd');
                        };

                        $.setDataset(event.target, 'old', format(event.detail.old));
                        $.setDataset(event.target, 'new', format(event.detail.new));
                        $.setDataset(event.target, 'count', ($.getDataset(event.target, 'count') || 0) + 1);
                    });
                }, multiDate);

                await page.getByLabel('Appointment').click();

                await expect(page.getByRole('dialog')).toBeVisible();

                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();

                await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
                expect(await page.evaluate(() => {
                    const date = $('#date').datetimepicker('getDate');

                    return (Array.isArray(date) ? date[0] : date).format('yyyy-MM-dd');
                })).toBe('2026-09-15');

                await page.getByRole('button', { name: 'Set', exact: true }).click();

                await expect(page.getByRole('dialog')).toHaveCount(0);
                await expect(page.getByLabel('Appointment')).toHaveValue(multiDate ? '2026-09-15,2026-09-16' : '2026-09-16');
                await expect(page.getByLabel('Appointment')).toHaveAttribute('data-old', '2026-09-15');
                await expect(page.getByLabel('Appointment')).toHaveAttribute('data-count', '1');
                await expect(page.getByLabel('Appointment')).toHaveAttribute('data-new', multiDate ? '2026-09-15,2026-09-16' : '2026-09-16');
                await expect(page.getByLabel('Appointment')).toBeFocused();
            });
        }

        test('discards a multi-date draft through Cancel', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true, multiDate: true }));

            await page.getByLabel('Appointment').click();
            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate').length)).toBe(1);
        });

        for (const { close, dismiss } of [
            {
                close: 'Cancel',
                dismiss: (page) => page.getByRole('button', { name: 'Cancel', exact: true }).click(),
            },
            {
                close: 'Escape',
                dismiss: (page) => page.keyboard.press('Escape'),
            },
            {
                close: 'backdrop',
                dismiss: (page) => page.locator('.modal').click({ position: { x: 5, y: 5 } }),
            },
        ]) {
            test(`discards draft edits through ${close}`, async ({ page }) => {
                await page.evaluate(() => {
                    UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true });
                    $.addEvent('#date', 'change.ui.datetimepicker', (event) => $.setDataset(event.target, 'changed', true));
                });

                await page.getByLabel('Appointment').click();
                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                await dismiss(page);

                await expect(page.getByRole('dialog')).toHaveCount(0);
                await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
                await expect(page.getByLabel('Appointment')).not.toHaveAttribute('data-changed');
                expect(await page.evaluate(() => $('#date').datetimepicker('getDate').format('yyyy-MM-dd'))).toBe('2026-09-15');
            });
        }

        test('retains an uncommitted draft when hiding is canceled', async ({ page }) => {
            await page.evaluate(() => {
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true }).show();
                $.addEventOnce('#date', 'hide.ui.datetimepicker', () => false);
            });

            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'Set', exact: true }).click();

            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');

            await page.getByRole('button', { name: 'Cancel', exact: true }).click();

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
        });

        test('cancels opening without leaving a wrapper in the document', async ({ page }) => {
            await page.evaluate(() => {
                $.addEvent('#date', 'show.ui.datetimepicker', () => false);
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true }).show();
            });

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test.describe('focus and keyboard', () => {
        test('opens from the keyboard and returns focus', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true }));

            await page.getByLabel('Appointment').focus();
            await page.getByLabel('Appointment').press('Enter');

            await expect(page.getByRole('dialog', { name: 'Select Date', exact: true })).toBeVisible();

            await page.keyboard.press('Escape');

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toBeFocused();
        });

        test('redirects Tab and Shift+Tab away from outside page controls', async ({ page }) => {
            await page.evaluate(() => {
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true }).show();
                $.append(document.body, '<button id="outside">Outside</button>');
            });

            await expect(page.getByRole('dialog')).toHaveAttribute('aria-hidden', 'false');

            const first = page.getByRole('button', { name: 'Previous Month', exact: true });
            const last = page.getByRole('button', { name: 'Set', exact: true });

            await last.focus();
            await page.keyboard.press('Tab');

            await expect(first).toBeFocused();

            await page.keyboard.press('Shift+Tab');

            await expect(last).toBeFocused();
        });

        test('keeps a parent UI modal open and restores its input focus', async ({ page }) => {
            await page.evaluate(() => {
                const parent = $.create('div');

                $.setProperty(parent, 'id', 'parent');
                $.setAttribute(parent, 'class', 'modal');
                $.setHtml(parent, '<div class="modal-dialog"><div class="modal-content"><div class="modal-body"></div></div></div>');
                $.append(document.body, parent);
                $.append($.findOne('.modal-body', parent), [$.findOne('label'), $.findOne('#date')]);
                UI.Modal.init(parent).show();
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true });
            });

            await expect(page.locator('#parent')).toHaveClass(/show/);

            await page.getByLabel('Appointment').click();

            await expect(page.getByRole('dialog', { name: 'Select Date', exact: true })).toBeVisible();

            await page.keyboard.press('Escape');

            await expect(page.getByRole('dialog', { name: 'Select Date', exact: true })).toHaveCount(0);
            await expect(page.locator('#parent')).toHaveClass(/show/);
            await expect(page.getByLabel('Appointment')).toBeFocused();
        });
    });

    test.describe('format and attachment', () => {
        for (const { format, title } of [
            { format: 'HH:mm', title: 'Select Time' },
            { format: 'yyyy-MM-dd HH:mm', title: 'Select Date & Time' },
        ]) {
            test(`names a ${format} modal and attaches it to the configured container`, async ({ page }) => {
                await page.evaluate((pattern) => {
                    $.append(document.body, '<div id="container"></div>');
                    UI.DateTimePicker.init($.findOne('#date'), {
                        format: pattern,
                        modal: true,
                        appendTo: '#container',
                        showToolbar: true,
                    }).show();
                }, format);

                await expect(page.locator('#container').getByRole('dialog', { name: title, exact: true })).toBeVisible();

                await page.getByRole('button', { name: 'Cancel', exact: true }).click();

                await expect(page.locator('#container .modal')).toHaveCount(0);
            });
        }
    });

    test.describe('mobileModal option', () => {
        for (const { device, userAgent } of [
            { device: 'mobile', userAgent: 'iPhone' },
            { device: 'desktop', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' },
        ]) {
            for (const mobileModal of [false, true]) {
                test(`opens a ${device === 'mobile' && mobileModal ? 'modal' : 'popup'} on ${device} with mobileModal=${mobileModal}`, async ({ page }) => {
                    await page.evaluate(({ userAgent, mobileModal }) => {
                        Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
                        UI.DateTimePicker.init($.findOne('#date'), {
                            format: 'yyyy-MM-dd',
                            modal: false,
                            mobileModal,
                        });
                    }, { userAgent, mobileModal });

                    await page.getByLabel('Appointment').click();

                    const dialog = page.getByRole('dialog', { name: 'Select Date', exact: true });

                    await expect(dialog).toBeVisible();

                    if (device === 'mobile' && mobileModal) {
                        await expect(dialog).toHaveAttribute('aria-modal', 'true');
                    } else {
                        await expect(dialog).not.toHaveAttribute('aria-modal');
                    }
                });
            }
        }
    });

    test.describe('disposal', () => {
        for (const event of ['show', 'shown', 'hide', 'hidden', 'change']) {
            test(`can be disposed from ${event}`, async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', modal: true });

                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => picker.dispose());
                    picker.show();
                }, event);
                if (['hide', 'hidden', 'change'].includes(event)) {
                    await expect(page.getByRole('dialog')).toBeVisible();

                    if (event === 'change') {
                        await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                        await page.getByRole('button', { name: 'Set', exact: true }).click();
                    } else {
                        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
                    }
                }

                await expect(page.locator('.modal')).toHaveCount(0);
                await expect(page.locator('.modal-backdrop')).toHaveCount(0);
                await expect(page.locator('body')).not.toHaveClass(/modal-open/);
                await expect(page.getByLabel('Appointment')).toBeVisible();
            });
        }
    });
});
