import { expect, test } from '#test';
import { setupInput } from '../setup/browser.js';

test.describe('DateTimePicker time', () => {
    test.beforeEach(setupInput);

    test('selects hours and minutes from the time grids', async ({ page }) => {
        await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
            format: 'HH:mm',
            inline: true,
            minuteStepping: 5,
        }));

        await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
        await page.getByRole('button', { name: '14', exact: true }).click();
        await page.getByRole('button', { name: 'Select Minute', exact: true }).click();
        await page.getByRole('button', { name: '35', exact: true }).click();

        await expect(page.locator('#date')).toHaveValue('14:35');
    });

    test.describe('isValidTime option', () => {
        test('finds valid times that do not fall on a five-minute boundary', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm',
                inline: true,
                isValidTime: (date) => date.getHours() === 10 && date.getMinutes() === 17,
            }));

            await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toHaveText('10');
            await expect(page.getByRole('button', { name: 'Select Minute', exact: true })).toHaveText('17');
        });

        test('validates hour choices with the minutes preserved by selection', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm',
                inline: true,
                isValidTime: (date) => date.getHours() === 10 ? date.getMinutes() === 17 : date.getMinutes() === 0,
            }).setDate('10:17'));

            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();

            await expect(page.getByRole('button', { name: '10', exact: true })).toBeEnabled();
            await expect(page.getByRole('button', { name: '11', exact: true })).toBeDisabled();

            await page.getByRole('button', { name: '10', exact: true }).click();

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('10:17');
        });

        test('validates minute choices with the seconds preserved by selection', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm:ss',
                inline: true,
                isValidTime: (date) => date.getSeconds() === 30,
            }).setDate('12:15:30'));

            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();

            await expect(page.getByRole('button', { name: '20', exact: true })).toBeEnabled();

            await page.getByRole('button', { name: '20', exact: true }).click();

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('12:20:30');
        });

        test('handles a day with no valid time', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm',
                inline: true,
                isValidTime: () => false,
            }));

            await expect(page.locator('.datetimepicker')).toBeVisible();

            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();

            await expect(page.locator('[data-ui-hour]')).toHaveCount(0);
            await expect(page.locator('#date')).toHaveValue('');
        });
    });

    test.describe('time controls', () => {
        for (const { view, start, target, next, expected } of [
            { view: 'Hour', start: '12', target: '18', next: '19', expected: '19:30' },
            { view: 'Minute', start: '30', target: '45', next: '50', expected: '12:50' },
        ]) {
            test(`continues ${view} keyboard navigation from mouse focus after refreshing`, async ({ page }) => {
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'HH:mm',
                    inline: true,
                    minuteStepping: 5,
                }).setDate('12:30'));

                await page.getByRole('button', { name: `Select ${view}`, exact: true }).click();

                await expect(page.getByRole('button', { name: start, exact: true })).toBeFocused();

                await page.evaluate(() => $('#date').datetimepicker('refresh'));

                await page.getByRole('button', { name: target, exact: true }).dispatchEvent('mousedown', { button: 0 });

                await expect(page.getByRole('button', { name: target, exact: true })).toBeFocused();

                await page.keyboard.press('ArrowRight');

                await expect(page.getByRole('button', { name: next, exact: true })).toBeFocused();

                await page.keyboard.press('Enter');

                await expect(page.locator('#date')).toHaveValue(expected);
            });
        }

        test('restores the first enabled minute tab stop after refreshing an unmatched minute', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm',
                inline: true,
                isValidTime: (date) => date.getMinutes() >= 10,
            }).setDate('12:32'));

            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();

            await expect(page.getByRole('button', { name: '10', exact: true })).toBeFocused();

            await page.keyboard.press('ArrowRight');

            await expect(page.getByRole('button', { name: '15', exact: true })).toBeFocused();

            await page.evaluate(() => $('#date').datetimepicker('refresh'));

            await expect(page.getByRole('button', { name: '10', exact: true })).toHaveAttribute('tabindex', '0');
            await expect(page.locator('[data-ui-minute][tabindex="0"]')).toHaveCount(1);
            await expect(page.getByRole('button', { name: '00', exact: true })).toHaveAttribute('tabindex', '-1');

            await page.getByRole('button', { name: '10', exact: true }).focus();
            await page.keyboard.press('ArrowRight');

            await expect(page.getByRole('button', { name: '15', exact: true })).toBeFocused();
        });

        test('keeps date and time grid focus independent in side-by-side mode', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                inline: true,
                sideBySide: true,
            }).setDate('2026-09-15 12:30'));

            const date = page.getByRole('button', { name: 'September 17, 2026', exact: true });

            await date.dispatchEvent('mousedown', { button: 0 });

            await expect(date).toBeFocused();

            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
            await page.keyboard.press('ArrowRight');

            await expect(page.getByRole('button', { name: '13', exact: true })).toBeFocused();

            await date.focus();
            await page.keyboard.press('ArrowRight');

            await expect(page.getByRole('button', { name: 'September 18, 2026', exact: true })).toBeFocused();
            await expect(page.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);
            await expect(page.locator('[data-ui-hour][tabindex="0"]')).toHaveCount(1);
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('[data-ui-focus]')).toHaveCount(0);
        });

        for (const { control, expected } of [
            { control: 'Increment Hour', expected: '13:30' },
            { control: 'Decrement Hour', expected: '11:30' },
            { control: 'Increment Minute', expected: '12:35' },
            { control: 'Decrement Minute', expected: '12:25' },
        ]) {
            test(`changes time through ${control}`, async ({ page }) => {
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'HH:mm',
                    inline: true,
                    minuteStepping: 5,
                }).setDate('12:30'));

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
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'HH:mm',
                    inline: true,
                    minuteStepping: 5,
                }).setDate('12:30'));

                await page.getByRole('button', { name: control, exact: true }).press(key);

                await expect(page.locator('#date')).toHaveValue(expected);
                await expect(page.getByRole('button', { name: control, exact: true })).toBeFocused();
            });
        }

        test('toggles the period by mouse and keyboard', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'hh:mm a',
                inline: true,
            }).setDate('10:30 am'));

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
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'HH:mm',
                    inline: true,
                    minuteStepping: 5,
                }).setDate('12:30'));

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
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                inline: true,
                showToolbar: true,
            }).setDate('2026-09-15 12:30'));

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
                await page.evaluate((pattern) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: pattern,
                    showClose: true,
                }).show(), format);

                await page.getByRole('button', { name: 'Close', exact: true }).click();

                await expect(page.getByRole('dialog')).toHaveCount(0);
                await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
            });
        }
    });

    test.describe('minuteStepping option', () => {
        test('displays selectable minute intervals and disabled time choices', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm',
                inline: true,
                minuteStepping: 15,
                isValidTime: (date) => date.getMinutes() !== 15,
            }).setDate('12:30'));

            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();

            await expect(page.locator('[data-ui-minute]')).toHaveCount(3);
            await expect(page.getByRole('button', { name: '15', exact: true })).toBeDisabled();

            await page.getByRole('button', { name: '45', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('12:45');
        });

        test('rounds across an hour boundary', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'HH:mm',
                minuteStepping: 5,
            }).setDate('12:59'));

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('13:00');
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
                    format: pattern,
                    inline: true,
                    showToolbar: true,
                }).setDate(date), { pattern: format, date: value });

                await expect(page.locator('.datetimepicker > .p-3')).toContainText(expected);

                await page.evaluate(() => $('#date').datetimepicker('clear'));

                await expect(page.locator('.datetimepicker > .p-3')).toContainText('-');
                await expect(page.locator('#date')).toHaveValue('');
            });
        }
    });
});
