import { expect, test } from '#test';

test.describe('DateTimePicker formats and limits', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate((_) => {
            document.body.innerHTML = '<label for="date">Appointment</label><input id="date">';
            Object.assign(UI.DateTimePicker.defaults, { locale: 'en-GB', timeZone: 'UTC', mobileModal: false, duration: 0 });
        });
    });

    test.describe('locale and time zone', () => {
        test('uses the public default-date formatter consistently', async ({ page }) => {
            const format = await page.evaluate((_) => UI.DateTimePicker.getDefaultDateFormat('en-GB'));
            expect(format).toBe('dd/MM/yyyy');
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { multiDate: true }).setDate([[2026, 9, 15]]));
            await expect(page.getByLabel('Appointment')).toHaveValue('15/09/2026');
        });
        for (const { locale, weekday } of [{ locale: 'en-US', weekday: 'Sunday' }, { locale: 'en-GB', weekday: 'Monday' }]) {
            test(`starts the ${locale} calendar on ${weekday}`, async ({ page }) => {
                await page.evaluate((language) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd', inline: true, locale: language }), locale);
                await expect(page.locator('th[abbr]').first()).toHaveAttribute('abbr', weekday);
            });
        }

        for (const { timeZone, expected } of [
            { timeZone: 'UTC', expected: '2026-09-15 12:30' },
            { timeZone: 'Australia/Brisbane', expected: '2026-09-15 22:30' },
            { timeZone: 'America/New_York', expected: '2026-09-15 08:30' },
        ]) {
            test(`formats the same instant in ${timeZone}`, async ({ page }) => {
                await page.evaluate((zone) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd HH:mm', timeZone: zone, useCurrent: true }), timeZone);
                await expect(page.getByLabel('Appointment')).toHaveValue(expected);
            });
        }

        test('rejects an impossible DST wall time and accepts a repeated wall time', async ({ page }) => {
            const picker = await page.evaluateHandle((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd HH:mm', timeZone: 'America/New_York' }));
            await picker.evaluate((value) => value.setDate('2026-03-08 02:30'));
            await expect(page.getByLabel('Appointment')).toHaveValue('');
            await picker.evaluate((value) => value.setDate('2026-11-01 01:30'));
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-11-01 01:30');
            expect(await picker.evaluate((value) => value.getDate().withTimeZone('UTC').format('HH:mm'))).toBe('06:30');
        });
    });

    test.describe('format validation', () => {
        for (const { format, error, multiDate = false } of [
            { format: 'MM', error: 'Month selector requires a year.' },
            { format: 'mm', error: 'Minute selector requires hours.' },
            { format: 'yyyy HH', error: 'Date/time selector requires a day of month.' },
            { format: 'yyyy-MM-dd HH:mm', multiDate: true, error: 'Time selector cannot be used with multiDate option.' },
        ]) {
            test(`rejects ${format} with multiDate=${multiDate}`, async ({ page }) => {
                expect(await page.evaluate((options) => {
                    try {
                        UI.DateTimePicker.init(document.querySelector('#date'), options);
                    } catch (error) {
                        return error.message;
                    }
                }, { format, multiDate })).toBe(error);
                expect(await page.evaluate((_) => $.hasData('#date', 'datetimepicker'))).toBe(false);
            });
        }

        test('requires an explicit alternate format for ISO strings', async ({ page }) => {
            const picker = await page.evaluateHandle((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'dd/MM/yyyy' }));
            await picker.evaluate((value) => value.setDate('2026-09-15'));
            await expect(page.getByLabel('Appointment')).toHaveValue('');
            expect(await picker.evaluate((value) => value.getDate())).toBeNull();
            await picker.evaluate((value) => value.dispose());
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'dd/MM/yyyy', altFormats: ['yyyy-MM-dd'],
            }).setDate('2026-09-15'));
            await expect(page.getByLabel('Appointment')).toHaveValue('15/09/2026');
        });

        test('ignores quoted literal tokens and preserves leap days', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd \'hours\'' }).setDate('2024-02-29 hours'));
            await expect(page.getByLabel('Appointment')).toHaveValue('2024-02-29 hours');
            await page.evaluate((_) => $('#date').datetimepicker('setDate', '2025-02-29 hours'));
            await expect(page.getByLabel('Appointment')).toHaveValue('');
        });
    });

    test.describe('validation callbacks', () => {
        for (const { format, callback, label } of [
            { format: 'yyyy-MM-dd', callback: 'isValidDay', label: 'September 16, 2026' },
            { format: 'yyyy-MM', callback: 'isValidMonth', label: 'Oct' },
            { format: 'yyyy', callback: 'isValidYear', label: '2027' },
        ]) {
            test(`marks unavailable ${callback} choices disabled`, async ({ page }) => {
                await page.evaluate(({ pattern, name }) => UI.DateTimePicker.init(document.querySelector('#date'), {
                    format: pattern, inline: true,
                    [name]: (date) => {
                        if (name === 'isValidDay') {
                            return date.getDate() !== 16;
                        }
                        if (name === 'isValidMonth') {
                            return date.getMonth() !== 10;
                        }
                        return date.getYear() !== 2027;
                    },
                }), { pattern: format, name: callback });
                await expect(page.getByRole('button', { name: label, exact: true })).toBeDisabled();
            });
        }

        test('finds valid times that do not fall on a five-minute boundary', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'HH:mm', inline: true, isValidTime: (date) => date.getHours() === 10 && date.getMinutes() === 17,
            }));
            await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toHaveText('10');
            await expect(page.getByRole('button', { name: 'Select Minute', exact: true })).toHaveText('17');
        });

        test('validates hour choices with the minutes preserved by selection', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'HH:mm', inline: true,
                isValidTime: (date) => date.getHours() === 10 ? date.getMinutes() === 17 : date.getMinutes() === 0,
            }).setDate('10:17'));
            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
            await expect(page.getByRole('button', { name: '10', exact: true })).toBeEnabled();
            await expect(page.getByRole('button', { name: '11', exact: true })).toBeDisabled();
            await page.getByRole('button', { name: '10', exact: true }).click();
            await expect(page.getByLabel('Appointment')).toHaveValue('10:17');
        });

        test('validates minute choices with the seconds preserved by selection', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'HH:mm:ss', inline: true, isValidTime: (date) => date.getSeconds() === 30,
            }).setDate('12:15:30'));
            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();
            await expect(page.getByRole('button', { name: '20', exact: true })).toBeEnabled();
            await page.getByRole('button', { name: '20', exact: true }).click();
            await expect(page.getByLabel('Appointment')).toHaveValue('12:20:30');
        });

        test('handles a day with no valid time', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'HH:mm', inline: true, isValidTime: () => false }));
            await expect(page.locator('.datetimepicker')).toBeVisible();
            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
            await expect(page.locator('[data-ui-hour]')).toHaveCount(0);
            await expect(page.locator('#date')).toHaveValue('');
        });

        test('validates rounded minute rollover against inclusive bounds', async ({ page }) => {
            const picker = await page.evaluateHandle((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'yyyy-MM-dd HH:mm', minuteStepping: 5,
                minDate: '2026-09-15 23:55', maxDate: '2026-09-16 00:00',
            }));
            await picker.evaluate((value) => value.setDate('2026-09-15 23:59'));
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-16 00:00');
            await picker.evaluate((value) => value.setMaxDate('2026-09-15 23:55'));
            await expect(page.getByLabel('Appointment')).toHaveValue('');
            await picker.evaluate((value) => value.setDate('2026-09-15 23:59'));
            await expect(page.getByLabel('Appointment')).toHaveValue('');
            await picker.evaluate((value) => value.setDate('2026-09-15 23:54'));
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15 23:55');
            await picker.evaluate((value) => value.setDate('2026-09-15 23:51'));
            await expect(page.getByLabel('Appointment')).toHaveValue('');
        });

        test('honors millisecond precision on inclusive bounds', async ({ page }) => {
            await page.evaluate((_) => {
                const picker = UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd HH:mm:ss.SSS', minDate: [2026, 9, 15, 12, 30, 0, 500] });
                picker.setDate([2026, 9, 15, 12, 30, 0, 499]);
            });
            await expect(page.getByLabel('Appointment')).toHaveValue('');
            await page.evaluate((_) => $('#date').datetimepicker('setDate', [2026, 9, 15, 12, 30, 0, 500]));
            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15 12:30:00.500');
        });
    });
});
