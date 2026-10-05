import { expect, test } from '#test';
import { setupInput } from '../setup/browser.js';

test.describe('DateTimePicker', () => {
    test.beforeEach(setupInput);

    test.describe('#init', () => {
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

                return UI.DateTimePicker.init(node, {
                    modal: true,
                    multiDate: true,
                });
            });

            expect(await instance.evaluate((value) => value.options.format)).toBeNull();
            expect(await instance.evaluate((value) => value.options.modal)).toBe(true);
            await expect(page.locator('.datetimepicker-inline')).toBeVisible();
            await expect(page.locator('.modal')).toHaveCount(0);
        });

        test('uses the current date deterministically', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd HH:mm',
                useCurrent: true,
            }));

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15 12:30');
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
                format: 'yyyy-MM-dd',
                defaultDate: 0,
                minDate: 0,
                maxDate: 0,
            }));

            expect(await instance.evaluate((value) => value.getMinDate().getTimestamp())).toBe(0);
            expect(await instance.evaluate((value) => value.getMaxDate().getTimestamp())).toBe(0);
            expect(await instance.evaluate((value) => value.getViewDate().getTimestamp())).toBe(0);
        });

        test('rejects a non-input element', async ({ page }) => {
            expect(await page.evaluate(() => {
                try {
                    UI.DateTimePicker.init($.findOne('#outside'));
                } catch (error) {
                    return error.message;
                }
            })).toBe('DateTimePicker must be created on an input element.');
        });

        for (const { name, makeArgument } of [
            { name: 'null', makeArgument: () => null },
            { name: 'undefined', makeArgument: () => undefined },
            { name: 'selector string', makeArgument: () => '#date' },
            { name: 'malformed selector string', makeArgument: () => '[' },
            { name: 'element array', makeArgument: () => [$.findOne('#date')] },
            { name: 'QuerySet', makeArgument: () => $('#date') },
        ]) {
            test(`rejects constructor arguments (${name})`, async ({ page }) => {
                const argument = await page.evaluateHandle(makeArgument);
                const error = await page.evaluate((value) => {
                    try {
                        new UI.DateTimePicker(value);
                    } catch (error) {
                        return `${error.name}: ${error.message}`;
                    }
                }, argument);

                expect(error).toBe('TypeError: DateTimePicker must be created on an input element.');
            });
        }

        test.describe('failed initialization', () => {
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

            for (const callback of ['isValidDay', 'renderDay']) {
                test(`cleans up after ${callback} throws during initialization`, async ({ page }) => {
                    expect(await page.evaluate((name) => {
                        try {
                            UI.DateTimePicker.init($.findOne('#date'), {
                                format: 'yyyy-MM-dd',
                                inline: true,
                                useCurrent: true,
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

                    await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        inline: true,
                    }).setDate('2026-09-16'));

                    await expect(page.getByRole('button', { name: 'September 16, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
                });
            }
        });
    });

    test.describe('#dispose', () => {
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

            const input = page.getByLabel('Date', { exact: true });

            await expect(input).toBeVisible();
            await expect(input).toHaveCSS('display', 'inline-block');
            await expect(input).toHaveCSS('color', 'rgb(255, 0, 0)');
            await expect(input).toHaveAttribute('aria-controls', 'original');
            await expect(input).toHaveAttribute('aria-expanded', 'mixed');
            await expect(input).toHaveAttribute('data-user-change', 'true');
            await expect(input).not.toHaveAttribute('aria-haspopup');
        });

        test('cleans handlers and data from a detached time panel', async ({ page }) => {
            await page.evaluate(() => {
                $.setValue('#date', '2026-09-15 12:30');
                UI.DateTimePicker.init($.findOne('#date'), {
                    inline: true,
                    format: 'yyyy-MM-dd HH:mm',
                });
            });

            await page.getByRole('button', { name: 'Select Time', exact: true }).click();

            await page.evaluate(() => {
                window.timePanel = $.closest($.findOne('[data-ui-action="changeView"][data-ui-time-view="hours"]'), '.col')[0];
                window.panelClicks = 0;

                $.setData(window.timePanel, 'marker', true);
                $.addEvent(window.timePanel, 'click.ui.datetimepicker', () => window.panelClicks++);
            });

            await page.getByRole('button', { name: 'Select Date', exact: true }).click();

            await expect.poll(() => page.evaluate(() => $.isConnected(window.timePanel))).toBe(false);

            await page.evaluate(() => {
                window.panelClicks = 0;
                $('#date').datetimepicker('dispose');
                $.triggerEvent(window.timePanel, 'click.ui.datetimepicker');
            });

            expect(await page.evaluate(() => window.panelClicks)).toBe(0);
            expect(await page.evaluate(() => $.hasData(window.timePanel, 'marker'))).toBe(false);
        });

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
                    format: pattern,
                    inline: true,
                    useCurrent: true,
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
    });

    test.describe('#clear', () => {
        for (const multiDate of [false, true]) {
            test(`clears a ${multiDate ? 'multi' : 'single'}-date selection`, async ({ page }) => {
                const instance = await page.evaluateHandle((multiple) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        multiDate: multiple,
                    });

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

    for (const { method, enabled } of [
        { method: 'disable', enabled: false },
        { method: 'enable', enabled: true },
    ]) {
        test.describe(`#${method}`, () => {
            test('updates the input and inline calendar', async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        inline: true,
                    });

                    picker.disable();
                    picker[name]();
                }, method);

                await expect(page.locator('#date')).toBeEnabled({ enabled });
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeEnabled({ enabled });
            });
        });
    }

    test.describe('#getDate', () => {
        test('returns a copy of the multi-date selection', async ({ page }) => {
            expect(await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    multiDate: true,
                });

                picker.setDate(['2026-09-15']);
                picker.getDate().pop();

                return picker.getDate().length;
            })).toBe(1);
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15');
        });
    });

    test.describe('#getViewDate', () => {
        test('returns the date reached by calendar navigation', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                inline: true,
            }));

            await page.getByRole('button', { name: 'Next Month', exact: true }).click();

            expect(await page.evaluate(() => $('#date').datetimepicker('getViewDate').format('yyyy-MM-dd'))).toBe('2026-10-15');
        });
    });

    for (const bound of ['Min', 'Max']) {
        test.describe(`#get${bound}Date`, () => {
            test('returns the configured bound', async ({ page }) => {
                expect(await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        minDate: '2026-09-01',
                        maxDate: '2026-09-30',
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
                format: 'yyyy-MM-dd',
                altFormats: ['dd/MM/yyyy'],
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
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    multiDate: true,
                });

                picker.setDate(['2026-09-16', 'invalid', '2026-09-15']);

                return picker;
            });

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15,2026-09-16');

            await instance.evaluate((value) => value.setDate([]));

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
        });

        test('rejects a scalar multi-date selection without changing the input', async ({ page }) => {
            expect(await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    multiDate: true,
                });

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
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        inline: true,
                    });

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
        for (const { name, refresh } of [
            {
                name: 'class',
                refresh: () => {
                    window.allowed = false;
                    UI.DateTimePicker.init($.findOne('#date')).refresh();
                },
            },
            {
                name: 'QuerySet',
                refresh: () => {
                    window.allowed = false;
                    $('#date').datetimepicker('refresh');
                },
            },
        ]) {
            test(`revalidates a selection after callback rules change (${name})`, async ({ page }) => {
                await page.evaluate(() => {
                    window.allowed = true;
                    UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        inline: true,
                        isValidDay: () => window.allowed,
                    }).setDate('2026-09-15');
                });

                await expect(page.locator('#date')).toHaveValue('2026-09-15');

                await page.evaluate(refresh);

                await expect(page.locator('#date')).toHaveValue('');
                await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeDisabled();
            });
        }
    });

    test.describe('#show', () => {
        test('renders a popup with selectable calendar dates', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show());

            await expect(page.locator('.datetimepicker')).toBeVisible();
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeVisible();
        });

        test('renders a modal with a Set button', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                format: 'yyyy-MM-dd',
                modal: true,
            }).show());

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
});
