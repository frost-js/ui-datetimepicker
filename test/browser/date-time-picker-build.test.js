import { expect, test } from '#test';

for (const { name, entry } of [
    { name: 'UMD', entry: '/' },
    { name: 'minified UMD', entry: '/?min' },
    { name: 'ESM', entry: '/esm' },
    { name: 'minified ESM', entry: '/esm?min' },
]) {
    test.describe(`DateTimePicker ${name}`, () => {
        test.use({ entry });

        test('preserves UI exports and registers a working picker', async ({ page }) => {
            expect(await page.evaluate(() => typeof UI.Modal)).toBe('function');
            expect(await page.evaluate(() => typeof UI.Popper)).toBe('function');

            await page.evaluate(() => {
                $.setHtml(document.body, '<label for="date">Date</label><input id="date">');
                $('#date').datetimepicker({
                    format: 'yyyy-MM-dd',
                    timeZone: 'UTC',
                    mobileModal: false,
                }).setDate([2026, 9, 15]);
            });

            await expect(page.getByLabel('Date')).toHaveValue('2026-09-15');
        });
    });
}
