import { expect, test } from '#test';
import { setupInput } from '../setup/browser.js';

/** @import { Page } from '@playwright/test'; */

/**
 * Creates a range picker with explicit calendar and popup settings.
 * @param {Page} page The test page.
 * @param {object} options Additional picker options.
 */
async function setupRange(page, options = {}) {
    await page.evaluate((options) => UI.DateTimePicker.init($.findOne('#date'), {
        range: true,
        format: 'yyyy-MM-dd',
        locale: 'en-GB',
        timeZone: 'UTC',
        mobileModal: false,
        ...options,
    }), options);
}

test.describe('DateTimePicker ranges', () => {
    test.beforeEach(setupInput);

    test.describe('#init', () => {
        test('uses data attributes and a locale-derived date format without an implicit range', async ({ page }) => {
            await page.evaluate(() => {
                $.setAttribute('#date', { 'data-ui-range': 'true', 'data-ui-locale': 'en-GB', 'data-ui-use-current': 'true' });
                $('#date').datetimepicker();
            });

            await expect(page.locator('#date')).toHaveValue('');

            await page.evaluate(() => $('#date').datetimepicker('setDate', [[2026, 11, 5], [2026, 11, 1]]));

            await expect(page.locator('#date')).toHaveValue('01/11/2026 – 05/11/2026');
        });

        for (const options of [
            { multiDate: true },
            { format: 'yyyy-MM-dd HH:mm' },
            { format: 'yyyy-MM' },
            { format: 'yyyy' },
            { rangeSeparator: '' },
            { rangeSeparator: null },
        ]) {
            test(`rejects incompatible options ${JSON.stringify(options)}`, async ({ page }) => {
                expect(await page.evaluate((options) => {
                    try {
                        UI.DateTimePicker.init($.findOne('#date'), { range: true, format: 'yyyy-MM-dd', ...options });
                    } catch (error) {
                        return error instanceof Error;
                    }
                }, options)).toBe(true);
                expect(await page.evaluate(() => $.hasData('#date', UI.DateTimePicker.DATA_KEY))).toBe(false);
                await expect(page.locator('.datetimepicker, .modal')).toHaveCount(0);
            });
        }
    });

    test.describe('#setDate', () => {
        for (const value of ['2026-09-15', [], ['2026-09-15'], ['2026-09-15', '2026-09-16', '2026-09-17']]) {
            test(`rejects an incomplete setter shape ${JSON.stringify(value)}`, async ({ page }) => {
                await setupRange(page);
                await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']));

                expect(await page.evaluate((value) => {
                    try {
                        $('#date').datetimepicker('setDate', value);
                    } catch (error) {
                        return error instanceof TypeError;
                    }
                }, value)).toBe(true);
                await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
            });
        }

        test('clears both endpoints when one date is invalid', async ({ page }) => {
            await setupRange(page);
            await page.evaluate(() => {
                const picker = $('#date').datetimepicker();

                picker.setDate(['2026-09-15', '2026-09-18']);
                picker.setDate(['2026-09-15', new Date(NaN)]);
            });

            await expect(page.locator('#date')).toHaveValue('');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
        });
    });

    test.describe('selection', () => {
        test('commits only a complete pair and returns independent arrays', async ({ page }) => {
            await setupRange(page);
            await page.evaluate(() => {
                $.addEvent('#date', 'change.ui.datetimepicker', (event) => {
                    $.setDataset(event.target, 'changes', ($.getDataset(event.target, 'changes') || 0) + 1);
                    event.detail.new?.pop();
                    event.detail.old?.pop();
                });
            });

            await page.getByLabel('Date', { exact: true }).click();
            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();

            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
            await expect(page.getByRole('status')).toContainText('Select an end date.');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();

            await page.getByRole('button', { name: 'September 18, 2026', exact: true }).click();

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-15 – 2026-09-18');
            await expect(page.getByLabel('Date', { exact: true })).toBeFocused();
            await expect(page.locator('#date')).toHaveAttribute('data-changes', '1');

            expect(await page.evaluate(() => {
                const picker = $('#date').datetimepicker();

                picker.getDate().pop();
                picker.setDate(['2026-09-18', '2026-09-15']);

                return picker.getDate().length;
            })).toBe(2);
            await expect(page.locator('#date')).toHaveAttribute('data-changes', '1');
        });

        for (const end of [15, 18]) {
            test(`preserves reverse and same-day pairs (end=${end})`, async ({ page }) => {
                await setupRange(page, { inline: true });

                await page.getByRole('button', { name: `September ${end}, 2026`, exact: true }).click();
                await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();

                await expect(page.locator('#date')).toHaveValue(`2026-09-15 – 2026-09-${end}`);
                await expect(page.locator('.datetimepicker-range-start')).toHaveAttribute('aria-pressed', 'true');
                await expect(page.locator('.datetimepicker-range-end')).toHaveAttribute('aria-pressed', 'true');

                if (end === 15) {
                    await expect(page.locator('.datetimepicker-range-start')).toHaveAccessibleDescription('Range start, Range end');
                } else {
                    const interior = page.getByRole('button', { name: 'September 16, 2026', exact: true });

                    await expect(interior).toHaveClass(/datetimepicker-range-between/);
                    await expect(interior).toHaveAttribute('aria-pressed', 'false');
                    await expect(interior).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
                }
            });
        }

        test('keeps the committed pair while choosing a replacement', async ({ page }) => {
            await setupRange(page, { keepOpen: true });
            await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']));
            await page.getByLabel('Date', { exact: true }).click();
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
            await expect(page.locator('.datetimepicker-range-between')).toHaveCount(0);

            await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();

            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.locator('#date')).toHaveValue('2026-09-21 – 2026-09-23');
        });
    });

    test.describe('hover preview', () => {
        test('previews either direction without committing or redrawing', async ({ page }) => {
            await setupRange(page, { inline: true });
            await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']));
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();
            await page.evaluate(() => $.addEvent('#date', 'change.ui.datetimepicker refresh.ui.datetimepicker', () => {
                $.setDataset('#date', 'notified', true);
            }));

            for (const day of [24, 18]) {
                await page.getByRole('button', { name: `September ${day}, 2026`, exact: true }).hover();

                await expect(page.locator('.datetimepicker-range-between')).toHaveCount(3);
                await expect(page.getByRole('button', { name: `September ${day}, 2026`, exact: true })).toHaveClass(/datetimepicker-range-between/);
                await expect(page.locator('[data-ui-date][aria-pressed="true"]')).toHaveCount(1);
                await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
                await expect(page.getByRole('status')).toContainText('Range start: September 21, 2026.');
            }

            await page.getByRole('button', { name: 'Outside', exact: true }).hover();

            await expect(page.locator('.datetimepicker-range-between')).toHaveCount(0);
            await expect(page.locator('#date')).not.toHaveAttribute('data-notified');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate')[0].format('yyyy-MM-dd'))).toBe('2026-09-15');

            await page.getByRole('button', { name: 'September 24, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'Outside', exact: true }).hover();

            await expect(page.locator('#date')).toHaveValue('2026-09-21 – 2026-09-24');
            await expect(page.locator('.datetimepicker-range-between')).toHaveCount(2);
        });

        test('clears the preview over disabled days and calendar navigation', async ({ page }) => {
            await setupRange(page, { inline: true, maxDate: '2026-09-24' });
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();

            for (const name of ['September 25, 2026', 'Select Month', 'September 21, 2026']) {
                await page.getByRole('button', { name: 'September 24, 2026', exact: true }).hover();

                await expect(page.locator('.datetimepicker-range-between')).toHaveCount(3);

                await page.getByRole('button', { name, exact: true }).hover();

                await expect(page.locator('.datetimepicker-range-between')).toHaveCount(0);
            }
        });
    });

    test.describe('keyboard and focus', () => {
        test('completes a range across a year boundary with the keyboard', async ({ page }) => {
            await setupRange(page, { inline: true, defaultDate: '2026-12-31', showToolbar: true });

            await page.getByRole('button', { name: 'December 31, 2026', exact: true }).focus();
            await page.keyboard.press('Space');
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('Enter');

            await expect(page.locator('#date')).toHaveValue('2026-12-31 – 2027-01-01');
            await expect(page.getByRole('button', { name: 'January 1, 2027', exact: true })).toBeFocused();
            await expect(page.locator('[data-ui-date][tabindex="0"]')).toHaveCount(1);
            await expect(page.locator('.datetimepicker .fs-3')).toHaveText('2026-12-31 – 2027-01-01');
        });

        test('cancels an inline draft with Escape', async ({ page }) => {
            await setupRange(page, { inline: true });
            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();
            await page.keyboard.press('Escape');

            await expect(page.getByRole('group', { name: 'Select Date Range', exact: true })).toBeVisible();
            await expect(page.getByRole('status')).toHaveText('Select a start date.');
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeFocused();
        });
    });

    test.describe('popup dismissal', () => {
        for (const dismiss of ['Escape', 'outside', 'hide', 'close']) {
            test(`discards a pending popup endpoint through ${dismiss}`, async ({ page }) => {
                await setupRange(page, { showClose: true });
                await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']));
                await page.getByLabel('Date', { exact: true }).click();
                await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();

                if (dismiss === 'Escape') {
                    await page.keyboard.press('Escape');
                } else if (dismiss === 'outside') {
                    await page.getByRole('button', { name: 'Outside', exact: true }).click();
                } else if (dismiss === 'close') {
                    await page.getByRole('button', { name: 'Close', exact: true }).click();
                } else {
                    await page.evaluate(() => $('#date').datetimepicker('hide'));
                }

                await expect(page.getByRole('dialog')).toHaveCount(0);
                await page.getByLabel('Date', { exact: true }).click();
                await page.getByRole('button', { name: 'September 22, 2026', exact: true }).click();

                await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
                await expect(page.getByRole('status')).toContainText('Select an end date.');
            });
        }

        test('preserves a pending endpoint when hiding is canceled', async ({ page }) => {
            await setupRange(page);
            await page.getByLabel('Date', { exact: true }).click();
            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();
            await page.evaluate(() => {
                $.addEventOnce('#date', 'hide.ui.datetimepicker', () => false);
                $('#date').datetimepicker('hide');
            });
            await page.getByRole('button', { name: 'September 18, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
        });
    });

    test.describe('modal commit and cancellation', () => {
        test.beforeEach(async ({ page }) => {
            await setupRange(page, { modal: true });
            await page.evaluate(() => {
                $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']);
                $.addEvent('#date', 'change.ui.datetimepicker', (event) => {
                    $.setDataset(event.target, 'changes', ($.getDataset(event.target, 'changes') || 0) + 1);
                    $.setDataset(event.target, 'old', event.detail.old?.map((date) => date.format('yyyy-MM-dd')).join(','));
                });
            });
            await page.getByLabel('Date', { exact: true }).click();
        });

        test('requires a completed pair and commits it once through Set', async ({ page }) => {
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();

            await expect(page.getByRole('button', { name: 'Set', exact: true })).toBeDisabled();

            await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();

            await expect(page.getByRole('button', { name: 'Set', exact: true })).toBeEnabled();
            await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate')[0].format('yyyy-MM-dd'))).toBe('2026-09-15');

            await page.getByRole('button', { name: 'Set', exact: true }).click();

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(page.locator('#date')).toHaveValue('2026-09-21 – 2026-09-23');
            await expect(page.locator('#date')).toHaveAttribute('data-changes', '1');
            await expect(page.locator('#date')).toHaveAttribute('data-old', '2026-09-15,2026-09-18');
        });

        for (const dismiss of ['Cancel', 'Escape', 'backdrop']) {
            test(`restores the original pair through ${dismiss}`, async ({ page }) => {
                await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();
                await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();

                if (dismiss === 'Escape') {
                    await page.keyboard.press('Escape');
                } else if (dismiss === 'backdrop') {
                    await page.locator('.modal').click({ position: { x: 5, y: 5 } });
                } else {
                    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
                }

                await expect(page.getByRole('dialog')).toHaveCount(0);
                await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
                await expect(page.locator('#date')).not.toHaveAttribute('data-changes');
            });
        }

        test('preserves the draft after a canceled Set dismissal without committing it', async ({ page }) => {
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();
            await page.evaluate(() => $.addEventOnce('#date', 'hide.ui.datetimepicker', () => false));
            await page.getByRole('button', { name: 'Set', exact: true }).click();

            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');

            await page.getByRole('button', { name: 'Cancel', exact: true }).click();

            await expect(page.locator('#date')).not.toHaveAttribute('data-changes');
        });

        test('keeps a programmatic replacement when a subsequent draft is canceled', async ({ page }) => {
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();
            await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-24', '2026-09-25']));
            await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-24 – 2026-09-25');
        });

        test('discards drafts during refresh and revalidates committed bounds', async ({ page }) => {
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();
            await page.evaluate(() => $('#date').datetimepicker('refresh'));

            await expect(page.getByRole('status')).toContainText('Range start: September 15, 2026.');
            await expect(page.locator('#date')).not.toHaveAttribute('data-changes');

            await page.evaluate(() => $('#date').datetimepicker('setMinDate', '2026-09-16'));
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
        });
    });

    test.describe('inclusive bounds', () => {
        test('validates endpoints at day precision while allowing disabled interior dates', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                range: true,
                format: 'yyyy-MM-dd',
                locale: 'en-GB',
                timeZone: 'UTC',
                inline: true,
                defaultDate: '2026-09-18',
                minDate: [2026, 9, 18, 12],
                maxDate: [2026, 9, 21, 9],
                isValidDay: (date) => date.getWeekDay() <= 5,
            }));

            await page.getByRole('button', { name: 'September 18, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-18 – 2026-09-21');
            await expect(page.getByRole('button', { name: 'September 19, 2026', exact: true })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'September 19, 2026', exact: true })).toHaveClass(/datetimepicker-range-between/);

            await page.evaluate(() => $('#date').datetimepicker('setMinDate', '2026-09-19'));

            await expect(page.locator('#date')).toHaveValue('');
            expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
        });
    });

    test.describe('locale and time zone', () => {
        test('normalizes endpoints in the configured zone across DST', async ({ page }) => {
            await setupRange(page, { timeZone: 'America/New_York' });
            await page.evaluate(() => $('#date').datetimepicker('setDate', [
                new Date('2026-03-09T12:00:00Z'),
                new Date('2026-03-08T12:00:00Z'),
            ]));

            await expect(page.locator('#date')).toHaveValue('2026-03-08 – 2026-03-09');
            expect(await page.evaluate(() => {
                const [start, end] = $('#date').datetimepicker('getDate');

                return end.getTimestamp() - start.getTimestamp();
            })).toBe(23 * 60 * 60);
        });

        test('renders localized endpoints and range status in RTL', async ({ page }) => {
            await page.evaluate(() => $.setAttribute(document.body, { dir: 'rtl', lang: 'ar' }));
            await setupRange(page, { locale: 'ar', inline: true });
            await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']));

            await expect(page.locator('.datetimepicker')).toHaveCSS('direction', 'rtl');
            await expect(page.locator('.datetimepicker-range-start')).toHaveAccessibleName(/[\u0600-\u06ff]/);
            await expect(page.getByRole('status')).toContainText(/[\u0600-\u06ff]/);
            await expect(page.locator('.datetimepicker-range-start')).toHaveAccessibleDescription('Range start');
            await expect(page.locator('.datetimepicker-range-end')).toHaveAccessibleDescription('Range end');
        });
    });

    test.describe('native synchronization', () => {
        test('normalizes alternate formats and a literal separator without duplicate changes', async ({ page }) => {
            await setupRange(page, { rangeSeparator: ' | ', altFormats: ['dd/MM/yyyy'] });
            await page.evaluate(() => $.findOne('#date').addEventListener('change', (event) => {
                $.setDataset(event.target, 'changes', ($.getDataset(event.target, 'changes') || 0) + 1);
            }));
            await page.getByLabel('Date', { exact: true }).fill('18/09/2026 | 15/09/2026');
            await page.getByLabel('Date', { exact: true }).press('Tab');

            await expect(page.locator('#date')).toHaveValue('2026-09-15 | 2026-09-18');
            await expect(page.locator('#date')).toHaveAttribute('data-changes', '1');

            await page.getByLabel('Date', { exact: true }).fill('');

            expect(await page.evaluate(() => $('#date').datetimepicker('getDate'))).toBeNull();
        });

        for (const keepInvalid of [false, true]) {
            test(`handles incomplete typed ranges with keepInvalid=${keepInvalid}`, async ({ page }) => {
                await setupRange(page, { keepInvalid });
                await page.evaluate(() => $('#date').datetimepicker('setDate', ['2026-09-15', '2026-09-18']));
                await page.getByLabel('Date', { exact: true }).fill('2026-09-21 – invalid');

                expect(await page.evaluate(() => $('#date').datetimepicker('getDate')?.length)).toBe(2);

                await page.getByLabel('Date', { exact: true }).press('Tab');

                await expect(page.locator('#date')).toHaveValue(keepInvalid ? '2026-09-21 – invalid' : '2026-09-15 – 2026-09-18');
                expect(await page.evaluate(() => $('#date').datetimepicker('getDate') === null)).toBe(keepInvalid);
            });
        }
    });

    test.describe('form reset and editability', () => {
        test('submits the pair and restores the original pair on form reset', async ({ page }) => {
            await page.evaluate(() => $.setHtml(document.body,
                '<form><label for="date">Date</label>' +
                '<input id="date" name="stay" value="2026-09-15 – 2026-09-18">' +
                '<button type="reset">Reset</button></form>',
            ));
            await setupRange(page, { inline: true });
            await page.getByRole('button', { name: 'September 21, 2026', exact: true }).click();
            await page.getByRole('button', { name: 'September 23, 2026', exact: true }).click();

            expect(await page.evaluate(() => new FormData($.findOne('form')).get('stay'))).toBe('2026-09-21 – 2026-09-23');

            await page.getByRole('button', { name: 'September 24, 2026', exact: true }).click();
            await page.evaluate(() => $.addEventOnce('form', 'reset', (event) => event.preventDefault()));
            await page.getByRole('button', { name: 'Reset', exact: true }).click();

            await expect(page.getByRole('status')).toContainText('Select an end date.');

            await page.getByRole('button', { name: 'Reset', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-15 – 2026-09-18');
            await expect(page.getByRole('status')).toContainText('Range end: September 18, 2026.');
        });

        for (const attribute of ['disabled', 'readonly']) {
            test(`cancels an inline draft when the input becomes ${attribute}`, async ({ page }) => {
                await setupRange(page, { inline: true });
                await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();
                await page.evaluate((name) => $.setAttribute('#date', name, ''), attribute);

                await expect(page.getByRole('status')).toHaveText('Select a start date.');
                await expect(page.getByRole('button', { name: 'September 16, 2026', exact: true })).toBeDisabled();

                await page.evaluate((name) => $.removeAttribute('#date', name), attribute);
                await page.getByRole('button', { name: 'September 16, 2026', exact: true }).click();

                await expect(page.locator('#date')).toHaveValue('');

                await page.getByRole('button', { name: 'September 18, 2026', exact: true }).click();

                await expect(page.locator('#date')).toHaveValue('2026-09-16 – 2026-09-18');
            });
        }
    });

    test.describe('callback reentrancy and disposal', () => {
        test('keeps a newer selection made by a refresh callback', async ({ page }) => {
            await setupRange(page, { inline: true });
            await page.evaluate(() => $.addEventOnce('#date', 'refresh.ui.datetimepicker', () => {
                $('#date').datetimepicker('setDate', ['2026-09-21', '2026-09-23']);
            }));
            await page.getByRole('button', { name: 'September 15, 2026', exact: true }).click();

            await expect(page.locator('#date')).toHaveValue('2026-09-21 – 2026-09-23');
            await expect(page.getByRole('button', { name: 'September 21, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
            await expect(page.getByRole('status')).toContainText('Range end: September 23, 2026.');
        });

        test('does not overwrite a selection replaced by a validator', async ({ page }) => {
            await page.evaluate(() => {
                let replace = false;
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    range: true,
                    format: 'yyyy-MM-dd',
                    isValidDay: () => {
                        if (replace) {
                            replace = false;
                            picker.setDate(['2026-09-21', '2026-09-23']);
                        }

                        return true;
                    },
                });

                replace = true;
                picker.setDate(['2026-09-15', '2026-09-18']);
            });

            await expect(page.locator('#date')).toHaveValue('2026-09-21 – 2026-09-23');
        });

        test('allows disposal from a range validation callback', async ({ page }) => {
            await page.evaluate(() => {
                let dispose = false;
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    range: true,
                    format: 'yyyy-MM-dd',
                    inline: true,
                    isValidDay: () => {
                        if (dispose) {
                            picker.dispose();
                        }

                        return true;
                    },
                });

                dispose = true;
                picker.setDate(['2026-09-15', '2026-09-18']);
            });

            await expect(page.locator('.datetimepicker')).toHaveCount(0);
            await expect(page.getByLabel('Date', { exact: true })).toBeVisible();
        });
    });
});
