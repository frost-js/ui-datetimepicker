import { expect, test } from '#test';

test.describe('DateTimePicker modal', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate((_) => {
            document.body.innerHTML = '<label for="date">Appointment</label><input id="date" value="2026-09-15">';
            Object.assign(UI.DateTimePicker.defaults, { format: 'yyyy-MM-dd', locale: 'en-GB', timeZone: 'UTC', modal: true, mobileModal: false });
        });
    });

    test.describe('commit and cancellation', () => {
        test('discards a multi-date draft through Cancel', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { multiDate: true }));
            await page.getByLabel('Appointment').click();
            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
            expect(await page.evaluate((_) => $('#date').datetimepicker('getDate').length)).toBe(1);
        });

        for (const multiDate of [false, true]) {
            test(`commits a ${multiDate ? 'multi-date' : 'single-date'} draft once with correct old and new dates`, async ({ page }) => {
                await page.evaluate((multiple) => {
                    UI.DateTimePicker.init(document.querySelector('#date'), { multiDate: multiple });
                    $.addEvent('#date', 'change.ui.datetimepicker', (event) => {
                        const format = (date) => Array.isArray(date) ? date.map((value) => value.format('yyyy-MM-dd')).join(',') : date?.format('yyyy-MM-dd');
                        event.target.dataset.old = format(event.detail.old);
                        event.target.dataset.new = format(event.detail.new);
                        event.target.dataset.count = Number(event.target.dataset.count || 0) + 1;
                    });
                }, multiDate);
                await page.getByLabel('Appointment').click();
                await expect(page.getByRole('dialog')).toBeVisible();
                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
                expect(await page.evaluate((_) => {
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

        for (const close of ['Cancel', 'Escape', 'backdrop']) {
            test(`discards draft edits through ${close}`, async ({ page }) => {
                await page.evaluate((_) => {
                    UI.DateTimePicker.init(document.querySelector('#date'));
                    $.addEvent('#date', 'change.ui.datetimepicker', (event) => event.target.dataset.changed = 'true');
                });
                await page.getByLabel('Appointment').click();
                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();
                if (close === 'Escape') {
                    await page.keyboard.press('Escape');
                } else if (close === 'backdrop') {
                    await page.locator('.modal').click({ position: { x: 5, y: 5 } });
                } else {
                    await page.getByRole('button', { name: close, exact: true }).click();
                }
                await expect(page.getByRole('dialog')).toHaveCount(0);
                await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15');
                await expect(page.getByLabel('Appointment')).not.toHaveAttribute('data-changed');
                expect(await page.evaluate((_) => $('#date').datetimepicker('getDate').format('yyyy-MM-dd'))).toBe('2026-09-15');
            });
        }

        test('retains an uncommitted draft when hiding is canceled', async ({ page }) => {
            await page.evaluate((_) => {
                UI.DateTimePicker.init(document.querySelector('#date')).show();
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
            await page.evaluate((_) => {
                $.addEvent('#date', 'show.ui.datetimepicker', () => false);
                UI.DateTimePicker.init(document.querySelector('#date')).show();
            });
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test.describe('focus and keyboard', () => {
        test('redirects Tab and Shift+Tab away from outside page controls', async ({ page }) => {
            await page.evaluate((_) => {
                UI.DateTimePicker.init(document.querySelector('#date')).show();
                document.body.insertAdjacentHTML('beforeend', '<button id="outside">Outside</button>');
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

        test('opens from the keyboard and returns focus', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date')));
            await page.getByLabel('Appointment').focus();
            await page.getByLabel('Appointment').press('Enter');
            await expect(page.getByRole('dialog', { name: 'Select Date', exact: true })).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Appointment')).toBeFocused();
        });

        test('keeps a parent UI modal open and restores its input focus', async ({ page }) => {
            await page.evaluate((_) => {
                const parent = document.createElement('div');
                parent.id = 'parent';
                parent.className = 'modal';
                parent.innerHTML = '<div class="modal-dialog"><div class="modal-content"><div class="modal-body"></div></div></div>';
                document.body.append(parent);
                parent.querySelector('.modal-body').append(document.querySelector('label'), document.querySelector('#date'));
                UI.Modal.init(parent).show();
                UI.DateTimePicker.init(document.querySelector('#date'));
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

    test.describe('disposal', () => {
        for (const event of ['show', 'shown', 'hide', 'hidden', 'change']) {
            test(`can be disposed from ${event}`, async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init(document.querySelector('#date'));
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

    test.describe('format and attachment', () => {
        for (const { format, title } of [
            { format: 'HH:mm', title: 'Select Time' },
            { format: 'yyyy-MM-dd HH:mm', title: 'Select Date & Time' },
        ]) {
            test(`names a ${format} modal and attaches it to the configured container`, async ({ page }) => {
                await page.evaluate((pattern) => {
                    document.body.insertAdjacentHTML('beforeend', '<div id="container"></div>');
                    UI.DateTimePicker.init(document.querySelector('#date'), { format: pattern, appendTo: '#container', showToolbar: true }).show();
                }, format);
                await expect(page.locator('#container').getByRole('dialog', { name: title, exact: true })).toBeVisible();
                await page.getByRole('button', { name: 'Cancel', exact: true }).click();
                await expect(page.locator('#container .modal')).toHaveCount(0);
            });
        }
    });
});
