import { expect, test } from '#test';

test.describe('DateTimePicker styles', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => {
            $.setHtml(document.body,
                '<label for="date">Appointment</label><input class="input-outline" id="date" aria-describedby="help">' +
                '<p id="help">Choose an appointment.</p><div id="container"></div>',
            );
            Object.assign(UI.DateTimePicker.defaults, { locale: 'en-GB', timeZone: 'UTC', mobileModal: false, duration: 0 });
        });
    });

    test.describe('accessibility', () => {
        test('names the nonmodal dialog and restores its input relationship on disposal', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show());
            const dialog = page.getByRole('dialog', { name: 'Select Date', exact: true });
            await expect(dialog).toBeVisible();
            await expect(dialog).not.toHaveAttribute('aria-modal');
            await expect(dialog).toHaveAttribute('aria-describedby', 'help');
            await expect(page.getByLabel('Appointment')).toHaveAttribute('aria-controls', await dialog.getAttribute('id'));
            await expect(page.getByLabel('Appointment')).toHaveAttribute('aria-haspopup', 'dialog');
            await expect(page.getByLabel('Appointment')).toHaveAttribute('aria-expanded', 'true');
            await page.evaluate(() => $('#date').datetimepicker('dispose'));
            await expect(page.getByLabel('Appointment')).not.toHaveAttribute('aria-controls');
            await expect(page.getByLabel('Appointment')).not.toHaveAttribute('aria-expanded');
            await expect(page.getByLabel('Appointment')).toHaveAttribute('aria-describedby', 'help');
        });

        test('uses pressed state and excludes disabled dates from tab order', async ({ page }) => {
            await page.evaluate(() => {
                const picker = UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true, minDate: '2026-09-16' });
                picker.setDate('2026-09-17');
            });
            await expect(page.getByRole('button', { name: 'September 17, 2026', exact: true })).toHaveAttribute('aria-pressed', 'true');
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'September 15, 2026', exact: true })).toHaveAttribute('tabindex', '-1');
            await expect(page.locator('[aria-selected]')).toHaveCount(0);
        });
    });

    test.describe('layout', () => {
        for (const width of [991, 992]) {
            test(`aligns the wide layout and grid at ${width}px`, async ({ page }) => {
                await page.setViewportSize({ width, height: 800 });
                await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), {
                    format: 'yyyy-MM-dd HH:mm', inline: true, sideBySide: true,
                }));
                const menu = page.locator('.datetimepicker');
                await expect(menu).toHaveCSS('width', width < 992 ? '300px' : '600px');
                const columns = menu.locator(':scope > .row > .col');
                await expect(columns).toHaveCount(2);
                const first = await columns.nth(0).boundingBox();
                const second = await columns.nth(1).boundingBox();
                if (width < 992) {
                    expect(second.y).toBeGreaterThan(first.y);
                } else {
                    expect(second.y).toBeCloseTo(first.y, 0);
                    expect(second.x).toBeGreaterThan(first.x);
                }
            });
        }

        test('keeps vertical date/time panels narrow', async ({ page }) => {
            await page.setViewportSize({ width: 1200, height: 800 });
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd HH:mm', inline: true, sideBySide: true, vertical: true }));
            await expect(page.locator('.datetimepicker')).toHaveCSS('width', '300px');
            await expect(page.locator('.datetimepicker')).not.toHaveClass(/datetimepicker-wide/);
        });

        test('inherits RTL alignment and mirrors the today marker', async ({ page }) => {
            await page.evaluate(() => {
                $.setProperty(document.documentElement, 'dir', 'rtl');
                UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd', inline: true });
            });
            await expect(page.locator('.datetimepicker')).toHaveCSS('text-align', 'start');
            expect(await page.locator('.datetimepicker-today').evaluate((node) => getComputedStyle(node, '::before').left)).toBe('4px');
            expect(await page.locator('.datetimepicker-today').evaluate((node) => getComputedStyle(node, '::before').right)).not.toBe('4px');
        });

        test('exposes the UI-prefixed popup color variables', async ({ page }) => {
            await page.evaluate(() => UI.DateTimePicker.init($.findOne('#date'), { format: 'yyyy-MM-dd' }).show());
            await page.getByRole('dialog').evaluate((node) => $.setStyle(node, '--ui-datetimepicker-bg', 'rgb(10, 20, 30)'));
            await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(10, 20, 30)');
        });
    });

    test.describe('attachment and positioning', () => {
        for (const placement of ['top', 'bottom', 'left', 'right']) {
            test(`positions an attached popup at ${placement}`, async ({ page }) => {
                await page.setViewportSize({ width: 1400, height: 1000 });
                await page.evaluate((side) => {
                    $.setAttribute($.findOne('#date'), 'style', 'position:absolute;top:400px;left:600px;width:150px');
                    UI.DateTimePicker.init($.findOne('#date'), {
                        format: 'yyyy-MM-dd', appendTo: '#container', placement: side, position: 'center', fixed: true, spacing: 10,
                    }).show();
                }, placement);
                const dialog = page.locator('#container .datetimepicker');
                await expect(dialog).toBeVisible();
                const input = await page.getByLabel('Appointment').boundingBox();
                const menu = await dialog.boundingBox();
                if (placement === 'top') {
                    expect(menu.y + menu.height).toBeLessThanOrEqual(input.y);
                } else if (placement === 'bottom') {
                    expect(menu.y).toBeGreaterThanOrEqual(input.y + input.height);
                } else if (placement === 'left') {
                    expect(menu.x + menu.width).toBeLessThanOrEqual(input.x);
                } else {
                    expect(menu.x).toBeGreaterThanOrEqual(input.x + input.width);
                }
            });
        }
    });
});
