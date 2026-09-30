import { expect, test } from '#test';

test.describe('DateTimePicker', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate((_) => {
            document.body.innerHTML = '<label for="date">Date</label><input id="date" class="input-outline"><button id="outside">Outside</button>';
            Object.assign(UI.DateTimePicker.defaults, {
                duration: 0,
                locale: 'en-GB',
                mobileModal: false,
                timeZone: 'UTC',
            });
        });
    });

    test.describe('#init', () => {
        for (const { name, init } of [
            { name: 'class', init: () => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd' }) },
            { name: 'QuerySet', init: () => $('#date').datetimepicker({ format: 'yyyy-MM-dd' }) },
        ]) {
            test(`creates and registers an instance (${name})`, async ({ page }) => {
                await page.getByLabel('Date').fill('2026-09-15');
                const instance = await page.evaluateHandle(init);
                expect(await instance.evaluate((value) => value instanceof UI.DateTimePicker)).toBe(true);
                expect(await instance.evaluate((value) => $.getData('#date', 'datetimepicker') === value)).toBe(true);
                expect(await instance.evaluate((value) => value.node === document.querySelector('#date'))).toBe(true);
                expect(await instance.evaluate((value) => Object.isFrozen(value.options))).toBe(true);
                expect(await instance.evaluate((value) => value.getDate().format('yyyy-MM-dd'))).toBe('2026-09-15');
                await expect(page.getByLabel('Date')).toHaveValue('2026-09-15');
            });
        }

        test('reuses the instance and gives explicit options precedence over data attributes', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const node = document.querySelector('#date');
                node.dataset.uiFormat = 'MM/yyyy';
                const first = UI.DateTimePicker.init(node, { format: 'yyyy-MM-dd' });
                first.setDate([2026, 9, 15]);
                return first === UI.DateTimePicker.init(node, { format: 'yyyy' });
            })).toBe(true);
            await expect(page.getByLabel('Date')).toHaveValue('2026-09-15');
        });

        test('derives format and inline mode without mutating frozen options', async ({ page }) => {
            const instance = await page.evaluateHandle((_) => {
                const node = document.querySelector('#date');
                node.dataset.uiInline = 'true';
                return UI.DateTimePicker.init(node, { modal: true, multiDate: true });
            });
            expect(await instance.evaluate((value) => value.options.format)).toBeNull();
            expect(await instance.evaluate((value) => value.options.modal)).toBe(true);
            await expect(page.locator('.datetimepicker-inline')).toBeVisible();
            await expect(page.locator('.modal')).toHaveCount(0);
        });

        test('parses string bounds after resolving the default format', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
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
            const instance = await page.evaluateHandle((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'yyyy-MM-dd', defaultDate: 0, minDate: 0, maxDate: 0,
            }));
            expect(await instance.evaluate((value) => value.getMinDate().getTimestamp())).toBe(0);
            expect(await instance.evaluate((value) => value.getMaxDate().getTimestamp())).toBe(0);
            expect(await instance.evaluate((value) => value.getViewDate().getTimestamp())).toBe(0);
        });

        test('uses the current date deterministically', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'yyyy-MM-dd HH:mm', useCurrent: true,
            }));
            await expect(page.getByLabel('Date')).toHaveValue('2026-09-15 12:30');
        });

        for (const step of [0, -1, 61, 1.5, NaN, Infinity, '5']) {
            test(`rejects invalid minuteStepping ${step} without registering an instance`, async ({ page }) => {
                expect(await page.evaluate((minuteStepping) => {
                    try {
                        UI.DateTimePicker.init(document.querySelector('#date'), { minuteStepping });
                    } catch (error) {
                        return error.message;
                    }
                }, step)).toBe('minuteStepping must be an integer between 1 and 60.');
                expect(await page.evaluate((_) => $.hasData('#date', 'datetimepicker'))).toBe(false);
                await expect(page.locator('.datetimepicker')).toHaveCount(0);
            });
        }

        test('cleans up registration after an unsupported format', async ({ page }) => {
            expect(await page.evaluate((_) => {
                try {
                    UI.DateTimePicker.init(document.querySelector('#date'), { format: 'dd' });
                } catch (error) {
                    return error.message;
                }
            })).toBe('Date selector requires a month.');
            expect(await page.evaluate((_) => $.hasData('#date', 'datetimepicker'))).toBe(false);
        });
    });

    test.describe('#dispose', () => {
        for (const { name, dispose } of [
            { name: 'class', dispose: () => UI.DateTimePicker.init(document.querySelector('#date')).dispose() },
            { name: 'QuerySet', dispose: () => $('#date').datetimepicker('dispose') },
        ]) {
            test(`unregisters and permits reinitialization (${name})`, async ({ page }) => {
                const instance = await page.evaluateHandle((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd' }));
                await page.evaluate(dispose);
                expect(await instance.evaluate((value) => value.node)).toBeNull();
                expect(await instance.evaluate((value) => value.options)).toBeNull();
                expect(await page.evaluate((_) => $.hasData('#date', 'datetimepicker'))).toBe(false);
                await expect(page.getByLabel('Date')).toBeVisible();
                await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd' }).setDate([2026, 9, 16]));
                await expect(page.getByLabel('Date')).toHaveValue('2026-09-16');
            });
        }
    });

    test.describe('#clear', () => {
        for (const multiDate of [false, true]) {
            test(`clears a ${multiDate ? 'multi' : 'single'}-date selection`, async ({ page }) => {
                const instance = await page.evaluateHandle((multiple) => {
                    const picker = UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd', multiDate: multiple });
                    picker.setDate(multiple ? ['2026-09-15', '2026-09-16'] : '2026-09-15');
                    return picker;
                }, multiDate);
                await expect(page.getByLabel('Date')).not.toHaveValue('');
                await instance.evaluate((value) => value.clear());
                await expect(page.getByLabel('Date')).toHaveValue('');
                if (multiDate) {
                    expect(await instance.evaluate((value) => value.getDate().length)).toBe(0);
                } else {
                    expect(await instance.evaluate((value) => value.getDate())).toBeNull();
                }
            });
        }
    });

    test.describe('#setDate', () => {
        for (const { name, makeDate } of [
            { name: 'string', makeDate: () => '2026-09-16' },
            { name: 'tuple', makeDate: () => [2026, 9, 16] },
            { name: 'Date', makeDate: () => new Date('2026-09-16T00:00:00Z') },
            { name: 'DateTime', makeDate: () => DateTime.fromArray([2026, 9, 16], { timeZone: 'UTC' }) },
        ]) {
            test(`accepts a ${name}`, async ({ page }) => {
                const date = await page.evaluateHandle(makeDate);
                await page.evaluate((value) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd' }).setDate(value), date);
                await expect(page.getByLabel('Date')).toHaveValue('2026-09-16');
            });
        }

        test('preserves epoch zero', async ({ page }) => {
            await page.evaluate((_) => $('#date').datetimepicker({ format: 'yyyy-MM-dd HH:mm' }).setDate(0));
            await expect(page.getByLabel('Date')).toHaveValue('1970-01-01 00:00');
        });

        test('parses alternate formats and normalizes the input', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), {
                format: 'yyyy-MM-dd', altFormats: ['dd/MM/yyyy'],
            }).setDate('16/09/2026'));
            await expect(page.getByLabel('Date')).toHaveValue('2026-09-16');
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
                    const picker = UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd' });
                    picker.setDate('2026-09-15');
                    picker.setDate(value);
                }, date);
                await expect(page.getByLabel('Date')).toHaveValue('');
                expect(await page.evaluate((_) => $('#date').datetimepicker('getDate'))).toBeNull();
            });
        }

        test('sorts multi-date values, filters invalid input, and clears with an empty array', async ({ page }) => {
            const instance = await page.evaluateHandle((_) => {
                const picker = UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd', multiDate: true });
                picker.setDate(['2026-09-16', 'invalid', '2026-09-15']);
                return picker;
            });
            await expect(page.getByLabel('Date')).toHaveValue('2026-09-15,2026-09-16');
            await instance.evaluate((value) => value.setDate([]));
            await expect(page.getByLabel('Date')).toHaveValue('');
        });

        test('rejects a scalar multi-date selection without changing the input', async ({ page }) => {
            expect(await page.evaluate((_) => {
                const picker = UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd', multiDate: true });
                picker.setDate(['2026-09-15']);
                try {
                    picker.setDate('2026-09-16');
                } catch (error) {
                    return error.message;
                }
            })).toBe('multiDate requires an array of dates or null.');
            await expect(page.getByLabel('Date')).toHaveValue('2026-09-15');
        });
    });

    test.describe('#show', () => {
        test('renders the popup with current UI and DateTime', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd' }).show());
            await expect(page.locator('.datetimepicker')).toBeVisible();
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeVisible();
        });

        test('renders a UI 4 modal', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd', modal: true }).show());
            await expect(page.locator('.modal')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Set', exact: true })).toBeVisible();
        });
    });

    test.describe('user events', () => {
        test('navigates and selects a calendar date', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'yyyy-MM-dd', inline: true }));
            await page.getByRole('button', { name: 'Next Month', exact: true }).click();
            await page.getByRole('button', { name: 'October 16, 2026', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('2026-10-16');
        });

        test('selects hours and minutes with DateTime 8 methods', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'HH:mm', inline: true, minuteStepping: 5 }));
            await page.getByRole('button', { name: 'Select Hour', exact: true }).click();
            await page.getByRole('button', { name: '14', exact: true }).click();
            await page.getByRole('button', { name: 'Select Minute', exact: true }).click();
            await page.getByRole('button', { name: '35', exact: true }).click();
            await expect(page.locator('#date')).toHaveValue('14:35');
        });
    });

    test.describe('minuteStepping option', () => {
        test('rounds across an hour boundary', async ({ page }) => {
            await page.evaluate((_) => UI.DateTimePicker.init(document.querySelector('#date'), { format: 'HH:mm', minuteStepping: 5 }).setDate('12:59'));
            await expect(page.getByLabel('Date')).toHaveValue('13:00');
        });
    });

    test.describe('format option', () => {
        for (const { format, locale, period } of [
            { format: 'HH:mm', locale: 'en-US', period: false },
            { format: 'hh:mm a', locale: 'en-GB', period: true },
        ]) {
            test(`respects explicit ${format} in ${locale}`, async ({ page }) => {
                await page.evaluate((options) => UI.DateTimePicker.init(document.querySelector('#date'), { ...options, inline: true }), { format, locale });
                await expect(page.getByRole('button', { name: 'Toggle Period', exact: true })).toHaveCount(period ? 1 : 0);
            });
        }
    });
});
