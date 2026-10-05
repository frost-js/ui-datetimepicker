import { expect, test } from '#test';

test.describe('DateTimePicker forms', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
            $.setHtml(document.body,
                '<form id="form"><fieldset id="fields"><label for="date">Appointment</label>' +
                '<input id="date" name="appointment" class="input-outline" value="2026-09-15" required></fieldset>' +
                '<button type="reset">Reset</button><button type="submit">Submit</button></form>',
            );
            Object.assign(UI.DateTimePicker.defaults, { format: 'yyyy-MM-dd', locale: 'en-GB', timeZone: 'UTC', mobileModal: false, duration: 0 });
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
        test('respects disabled fieldsets and refreshes inline controls', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { inline: true });
                $.setProperty($.findOne('#fields'), 'disabled', true);
                picker.refresh();
            });
            await expect(page.locator('#date')).toBeDisabled();
            await expect(page.locator('.datetimepicker')).toHaveClass(/datetimepicker-disabled/);
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeDisabled();
            expect(await page.evaluate(() => new FormData($.findOne('form')).has('appointment'))).toBe(false);
            await page.evaluate(() => {
                $.setProperty($.findOne('#fields'), 'disabled', false);
                $('#date').datetimepicker('refresh');
            });
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeEnabled();
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
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { inline: true, multiDate: multiple });
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
        test('restores owned styles and attributes and preserves user event handlers', async ({ page }) => {
            await page.evaluate(() => {
                const node = $.findOne('#date');
                $.setStyle(node, 'display', 'inline-block');
                $.setAttribute(node, 'aria-controls', 'original');
                $.setAttribute(node, 'aria-expanded', 'mixed');
                $.addEvent(node, 'change.ui.datetimepicker', () => $.setDataset(node, 'userChange', true));
                const picker = UI.DateTimePicker.init(node, { inline: true });
                $.setStyle(node, 'color', 'red');
                picker.dispose();
                picker.dispose();
                $.triggerEvent(node, 'change', { bubbles: false, cancelable: false });
            });
            const input = page.getByLabel('Appointment');
            await expect(input).toBeVisible();
            await expect(input).toHaveCSS('display', 'inline-block');
            await expect(input).toHaveCSS('color', 'rgb(255, 0, 0)');
            await expect(input).toHaveAttribute('aria-controls', 'original');
            await expect(input).toHaveAttribute('aria-expanded', 'mixed');
            await expect(input).toHaveAttribute('data-user-change', 'true');
            await expect(input).not.toHaveAttribute('aria-haspopup');
        });
    });
});
