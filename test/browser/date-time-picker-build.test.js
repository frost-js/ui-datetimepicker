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
            expect(await page.evaluate((_) => typeof UI.Modal)).toBe('function');
            expect(await page.evaluate((_) => typeof UI.Popper)).toBe('function');
            await page.evaluate((_) => {
                document.body.innerHTML = '<label for="date">Date</label><input id="date">';
                $('#date').datetimepicker({ format: 'yyyy-MM-dd', timeZone: 'UTC', mobileModal: false }).setDate([2026, 9, 15]);
            });
            await expect(page.getByLabel('Date')).toHaveValue('2026-09-15');
        });
    });
}

test.describe('DateTimePicker formats', () => {
    test('caches each requested hour cycle separately', async ({ page }) => {
        for (const method of ['getDefaultFormat', 'getDefaultTimeFormat']) {
            const twelveHour = await page.evaluate((name) => UI.DateTimePicker[name]('en-US', true), method);
            const twentyFourHour = await page.evaluate((name) => UI.DateTimePicker[name]('en-US', false), method);
            expect(twelveHour).toContain('hh');
            expect(twelveHour).toContain('a');
            expect(twentyFourHour).toContain('HH');
            expect(twentyFourHour).not.toContain('a');
        }
    });
});
