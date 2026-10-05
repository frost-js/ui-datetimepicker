import { expect, test } from '#test';
import { setupInput } from '../setup/browser.js';

test.describe('DateTimePicker calendar', () => {
    test.beforeEach(setupInput);

    test.describe('selection and focus', () => {
        for (const sideBySide of [false, true]) {
            test(`selects a date and moves focus to time controls (sideBySide=${sideBySide})`, async ({ page }) => {
                await page.evaluate((side) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd HH:mm',
                    inline: true,
                    sideBySide: side,
                    isValidTime: (date) => date.getHours() === 10 && date.getMinutes() === 17,
                }), sideBySide);

                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();

                await expect(page.locator('#date')).toHaveValue('2026-09-16 10:17');
                await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toBeFocused();
            });
        }

        test('leaves the selection unchanged when a date has no valid times', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                inline: true,
                isValidTime: (date) => date.getDate() === 15,
            }).setDate('2026-09-15 12:30'));

            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-15 12:30');
        });

        test('clamps a selected day to its inclusive time bounds', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                inline: true,
                sideBySide: true,
                minDate: '2026-09-16 14:00',
                maxDate: '2026-09-17 09:00',
            }));

            await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-16 14:00');

            await page.getByRole('button', { name: 'September 17, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-17 09:00');
        });

        test('keeps keyboard navigation within calendar bounds', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                inline: true,
                minDate: '2026-09-15',
                maxDate: '2026-09-15',
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
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                inline: true,
            }));

            await page.getByRole('button', { name: 'Next Month', exact: true }).click();
            await page.getByRole('button', { name: 'October 16, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-10-16');
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
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    inline: true,
                }));

                await page.getByRole('button', { name: 'September 15, 2026', exact: true }).focus();
                await page.keyboard.press(key);

                await expect(page.getByRole('button', { name: date, exact: true })).toBeFocused();
                await expect(page.getByRole('button', { name: date, exact: true })).toHaveAttribute('tabindex', '0');
            });
        }

        test('selects with Space and preserves a single tab stop among dates', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                inline: true,
            }));

            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).focus();
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('Space');

            await expect(page.locator('#date')).toHaveValue('2026-09-16');
            await expect(page.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);
        });
    });

    test.describe('calendar views', () => {
        test('navigates decades, years, months, and days', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                inline: true,
            }));

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
                await page.evaluate((pattern) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: pattern,
                    inline: true,
                }), format);

                await page.getByRole('button', { name: start, exact: true }).focus();
                await page.keyboard.press(direction);

                await expect(page.getByRole('button', { name: target, exact: true })).toBeFocused();

                await page.keyboard.press('Enter');

                await expect(page.locator('#date')).not.toHaveValue('');
            });
        }

        for (const keepOpen of [false, true]) {
            test(`selects from a popup with keepOpen=${keepOpen}`, async ({ page }) => {
                await page.evaluate((keep) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    keepOpen: keep,
                }), keepOpen);

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

    test.describe('multiDate option', () => {
        test('normalizes typed dates using a custom separator', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                multiDate: true,
                multiDateSeparator: ';',
            }));

            await page.getByLabel('Date', { exact: true }).fill('2026-09-16;2026-09-15;2026-09-16');
            await page.getByRole('button', { name: 'Outside', exact: true }).click();

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15;2026-09-16');
        });

        for (const { format, values, expected, button } of [
            {
                format: 'yyyy-MM-dd',
                values: [[2026, 9, 15, 10], [2026, 9, 15, 12]],
                expected: '2026-09-15',
                button: 'September 15, 2026',
            },
            { format: 'yyyy-MM', values: [[2026, 9, 2], [2026, 9, 25]], expected: '2026-09', button: 'Sept' },
            { format: 'yyyy', values: [[2026, 1, 2], [2026, 9, 25]], expected: '2026', button: '2026' },
        ]) {
            test(`deduplicates and toggles values at ${format} precision`, async ({ page }) => {
                await page.evaluate(({ pattern, dates }) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: pattern,
                        multiDate: true,
                        inline: true,
                    });

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
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        keepInvalid: keep,
                    });

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

    for (const { callback, format, label } of [
        { callback: 'renderDay', format: 'yyyy-MM-dd', label: 'September 15, 2026' },
        { callback: 'renderMonth', format: 'yyyy-MM', label: 'Sept' },
        { callback: 'renderYear', format: 'yyyy', label: '2026' },
    ]) {
        test.describe(`${callback} option`, () => {
            test('customizes selectable cells', async ({ page }) => {
                await page.evaluate(({ name, pattern }) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: pattern,
                    inline: true,
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
                await page.evaluate((defaultView) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    defaultView,
                }).show(), view);

                await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
                await expect(page.locator('#date')).toHaveValue('');
            });
        }
    });
});
