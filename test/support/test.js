import { test as base, expect } from '@playwright/test';
import { setupClock } from '../setup/browser.js';

const test = base.extend({
    entry: ['/', { option: true }],
    uiPage: [
        async ({ page, entry }, use) => {
            await setupClock(page);
            await page.goto(entry, { waitUntil: 'load' });
            await page.waitForFunction((_) => window.UI?.DateTimePicker);
            await page.evaluate((_) => {
                if (!window.fQuery || !window.DateTime ||
                    typeof window.fQuery.QuerySet.prototype.datetimepicker !== 'function') {
                    throw new Error('Failed to initialize DateTimePicker on the test page.');
                }

                document.body.replaceChildren();
            });
            await page.waitForFunction((_) => {
                const node = document.createElement('div');
                node.className = 'datetimepicker text-center';
                document.body.append(node);
                const style = getComputedStyle(node);
                const ready = style.width === '300px' && style.textAlign === 'center';
                node.remove();
                return ready;
            });

            await use();
        },
        { auto: true },
    ],
});

export { expect, test };
