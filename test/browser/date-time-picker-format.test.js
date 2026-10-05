import { expect, test } from '#test';

test.describe('DateTimePicker formats and limits', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
            $.setHtml(document.body, '<label for="date">Appointment</label><input id="date">');
        });
    });

    test.describe('default formats', () => {
        test('uses the public default-date formatter consistently', async ({ page }) => {
            const format = await page.evaluate(() => UI.DateTimePicker.getDefaultDateFormat('en-GB'));

            expect(format).toBe('dd/MM/yyyy');

            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { multiDate: true }).setDate([[2026, 9, 15]]));

            await expect(page.getByLabel('Appointment')).toHaveValue('15/09/2026');
        });

        for (const method of ['getDefaultFormat', 'getDefaultTimeFormat']) {
            test(`caches each requested hour cycle separately (${method})`, async ({ page }) => {
                const twelveHour = await page.evaluate((name) => UI.DateTimePicker[name]('en-US', true), method);
                const twentyFourHour = await page.evaluate((name) => UI.DateTimePicker[name]('en-US', false), method);

                expect(twelveHour).toContain('hh');
                expect(twelveHour).toContain('a');
                expect(twentyFourHour).toContain('HH');
                expect(twentyFourHour).not.toContain('a');
            });
        }
    });

    test.describe('format option', () => {
        for (const { format, locale, period } of [
            { format: 'HH:mm', locale: 'en-US', period: false },
            { format: 'hh:mm a', locale: 'en-GB', period: true },
        ]) {
            test(`respects explicit ${format} in ${locale}`, async ({ page }) => {
                await page.evaluate((options) => UI.DateTimePicker.init($.findOne('#date'), {
                    ...options,
                    inline: true,
                }), { format, locale });

                await expect(page.getByRole('button', { name: 'Toggle Period', exact: true })).toHaveCount(period ? 1 : 0);
            });
        }
    });

    test.describe('locale and time zone', () => {
        for (const { locale, weekday } of [{ locale: 'en-US', weekday: 'Sunday' }, { locale: 'en-GB', weekday: 'Monday' }]) {
            test(`starts the ${locale} calendar on ${weekday}`, async ({ page }) => {
                await page.evaluate((language) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    inline: true,
                    locale: language,
                }), locale);

                await expect(page.locator('th[abbr]').first()).toHaveAttribute('abbr', weekday);
            });
        }

        for (const { timeZone, expected } of [
            { timeZone: 'UTC', expected: '2026-09-15 12:30' },
            { timeZone: 'Australia/Brisbane', expected: '2026-09-15 22:30' },
            { timeZone: 'America/New_York', expected: '2026-09-15 08:30' },
        ]) {
            test(`formats the same instant in ${timeZone}`, async ({ page }) => {
                await page.evaluate((zone) => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd HH:mm',
                    timeZone: zone,
                    useCurrent: true,
                }), timeZone);

                await expect(page.getByLabel('Appointment')).toHaveValue(expected);
            });
        }

        test('rejects an impossible DST wall time and accepts a repeated wall time', async ({ page }) => {
            const picker = await page.evaluateHandle(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                timeZone: 'America/New_York',
            }));

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
                        UI.DateTimePicker.init($.findOne('#date'), options);
                    } catch (error) {
                        return error.message;
                    }
                }, { format, multiDate })).toBe(error);
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
            });
        }

        test('requires an explicit alternate format for ISO strings', async ({ page }) => {
            const picker = await page.evaluateHandle(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'dd/MM/yyyy' }));

            await picker.evaluate((value) => value.setDate('2026-09-15'));

            await expect(page.getByLabel('Appointment')).toHaveValue('');
            expect(await picker.evaluate((value) => value.getDate())).toBeNull();

            await picker.evaluate((value) => value.dispose());
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'dd/MM/yyyy',
                altFormats: ['yyyy-MM-dd'],
            }).setDate('2026-09-15'));

            await expect(page.getByLabel('Appointment')).toHaveValue('15/09/2026');
        });

        test('ignores quoted literal tokens and preserves leap days', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd \'hours\'' }).setDate('2024-02-29 hours'));

            await expect(page.getByLabel('Appointment')).toHaveValue('2024-02-29 hours');

            await page.evaluate(() => $('#date').datetimepicker('setDate', '2025-02-29 hours'));

            await expect(page.getByLabel('Appointment')).toHaveValue('');
        });
    });

    test.describe('validation callbacks', () => {
        for (const { callback, label, init } of [
            {
                callback: 'isValidDay',
                label: 'September 16, 2026',
                init: () => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    inline: true,
                    isValidDay: (date) => date.getDate() !== 16,
                }),
            },
            {
                callback: 'isValidMonth',
                label: 'Oct',
                init: () => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM',
                    inline: true,
                    isValidMonth: (date) => date.getMonth() !== 10,
                }),
            },
            {
                callback: 'isValidYear',
                label: '2027',
                init: () => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy',
                    inline: true,
                    isValidYear: (date) => date.getYear() !== 2027,
                }),
            },
        ]) {
            test(`marks unavailable ${callback} choices disabled`, async ({ page }) => {
                await page.evaluate(init);

                await expect(page.getByRole('button', { name: label, exact: true })).toBeDisabled();
            });
        }
    });

    test.describe('inclusive bounds', () => {
        test('validates rounded minute rollover against inclusive bounds', async ({ page }) => {
            const picker = await page.evaluateHandle(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                minuteStepping: 5,
                minDate: '2026-09-15 23:55',
                maxDate: '2026-09-16 00:00',
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
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd HH:mm:ss.SSS',
                    minDate: [2026, 9, 15, 12, 30, 0, 500],
                });

                picker.setDate([2026, 9, 15, 12, 30, 0, 499]);
            });

            await expect(page.getByLabel('Appointment')).toHaveValue('');

            await page.evaluate(() => $('#date').datetimepicker('setDate', [2026, 9, 15, 12, 30, 0, 500]));

            await expect(page.getByLabel('Appointment')).toHaveValue('2026-09-15 12:30:00.500');
        });
    });
});
