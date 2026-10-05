import { expect, test } from '#test';
import { setupInput } from '../setup/browser.js';

test.describe('DateTimePicker events', () => {
    test.beforeEach(setupInput);

    test.describe('lifecycle events', () => {
        test('emits lifecycle events in order', async ({ page }) => {
            await page.evaluate(() => {
                window.events = [];

                for (const name of ['show', 'shown', 'hide', 'hidden']) {
                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => window.events.push(name));
                }
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show();
            });

            await expect.poll(() => page.evaluate(() => window.events.join(','))).toBe('show,shown');

            await page.evaluate(() => $('#date').datetimepicker('hide'));

            await expect.poll(() => page.evaluate(() => window.events.join(','))).toBe('show,shown,hide,hidden');
        });

        test('ignores interrupted popup animations and permits reopening', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await page.clock.install();
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    duration: 100,
                });

                window.shown = 0;
                window.hidden = 0;
                $.addEvent('#date', 'shown.ui.datetimepicker', () => window.shown++);
                $.addEvent('#date', 'hidden.ui.datetimepicker', () => window.hidden++);
                picker.show();
                picker.hide();
                picker.show();
            });
            await page.clock.runFor(300);

            await expect(page.getByRole('dialog')).toBeVisible();
            expect(await page.evaluate(() => window.shown)).toBe(1);
            expect(await page.evaluate(() => window.hidden)).toBe(0);

            await page.evaluate(() => $('#date').datetimepicker('hide'));
            await page.clock.runFor(300);

            await expect(page.getByRole('dialog')).toHaveCount(0);
            expect(await page.evaluate(() => window.hidden)).toBe(1);
        });
    });

    test.describe('change event', () => {
        test('reports selection changes once and suppresses unchanged values', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });

                picker.setDate('2026-09-15');
                window.changes = 0;
                $.addEvent('#date', 'change.ui.datetimepicker', (event) => {
                    window.changes++;
                    window.oldDate = event.detail.old?.format('yyyy-MM-dd');
                    window.newDate = event.detail.new?.format('yyyy-MM-dd');
                });
                picker.setDate('2026-09-16');
                picker.setDate('2026-09-16');
            });

            expect(await page.evaluate(() => window.changes)).toBe(1);
            expect(await page.evaluate(() => window.oldDate)).toBe('2026-09-15');
            expect(await page.evaluate(() => window.newDate)).toBe('2026-09-16');
            await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-09-16');
        });
    });

    test.describe('refresh event', () => {
        test('reports refresh view details', async ({ page }) => {
            await page.evaluate(() => {
                $.addEvent('#date', 'refresh.ui.datetimepicker', (event) => {
                    $.setDataset(event.target, 'view', event.detail.view);
                    $.setDataset(event.target, 'mode', event.detail.viewMode);
                });
                UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd',
                    inline: true,
                });
            });

            await expect(page.locator('#date')).toHaveAttribute('data-view', 'date');
            await expect(page.locator('#date')).toHaveAttribute('data-mode', 'days');
        });

        for (const multiDate of [false, true]) {
            test(`renders a ${multiDate ? 'multi-date' : 'single-date'} selection changed from a refresh callback`, async ({ page }) => {
                await page.evaluate((multiple) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd',
                        inline: true,
                        multiDate: multiple,
                    });

                    window.refreshes = 0;
                    $.addEvent('#date', 'refresh.ui.datetimepicker', () => {
                        window.refreshes++;
                        picker.setDate(multiple ? ['2026-09-17'] : '2026-09-17');
                    });
                    picker.setDate(multiple ? ['2026-09-16'] : '2026-09-16');
                }, multiDate);

                await expect(page.locator('#date')).toHaveValue('2026-09-17');
                await expect(page.getByRole('button', { name: 'September 17, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
                await expect(page.getByRole('button', { name: 'September 16, 2026', exact: true })).toHaveAttribute('aria-pressed', 'false');
                expect(await page.evaluate(() => window.refreshes)).toBe(1);
            });
        }

        test('renders a time changed from a refresh callback without recursive events', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'HH:mm',
                    inline: true,
                });

                window.refreshes = 0;
                $.addEvent('#date', 'refresh.ui.datetimepicker', () => {
                    window.refreshes++;
                    picker.setDate('15:10');
                });
                picker.setDate('14:45');
            });

            await expect(page.locator('#date')).toHaveValue('15:10');
            await expect(page.getByRole('button', { name: 'Select Hour', exact: true })).toHaveText('15');
            await expect(page.getByRole('button', { name: 'Select Minute', exact: true })).toHaveText('10');
            expect(await page.evaluate(() => window.refreshes)).toBe(1);
        });
    });

    test.describe('cancellation', () => {
        for (const event of ['show', 'hide']) {
            test(`allows canceling ${event}`, async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });

                    if (name === 'hide') {
                        picker.show();
                    }
                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => false);
                    picker[name]();
                }, event);

                await expect(page.getByRole('dialog')).toHaveCount(event === 'hide' ? 1 : 0);
                await expect(page.getByLabel('Date', { exact: true })).toHaveAttribute('aria-expanded', event === 'hide' ? 'true' : 'false');
            });
        }
    });

    test.describe('callback reentrancy and disposal', () => {
        test('does not re-enter show from its own event', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });

                $.addEvent('#date', 'show.ui.datetimepicker', () => picker.show());
                picker.show();
            });

            await expect(page.getByRole('dialog')).toHaveCount(1);
        });

        for (const event of ['show', 'shown', 'hide', 'hidden', 'change', 'refresh']) {
            test(`permits disposal from ${event}`, async ({ page }) => {
                await page.evaluate((name) => {
                    const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' });

                    $.addEvent('#date', `${name}.ui.datetimepicker`, () => picker.dispose());
                    if (name === 'change') {
                        picker.setDate('2026-09-16');
                    } else {
                        picker.show();
                    }
                }, event);
                if (['hide', 'hidden'].includes(event)) {
                    await expect(page.getByRole('dialog')).toBeVisible();

                    await page.evaluate(() => $('#date').datetimepicker('hide'));
                }

                await expect(page.getByRole('dialog')).toHaveCount(0);
                expect(await page.evaluate(() => $.hasData('#date', 'datetimepicker'))).toBe(false);
            });
        }
    });
});
