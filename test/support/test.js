import process from 'node:process';
import { test as base, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';
import { setupClock } from '../setup/browser.js';

const collectCoverage = process.env.FROST_UI_DATETIMEPICKER_COVERAGE === 'true';

const test = base.extend({
    entry: ['/', { option: true }],
    uiPage: [
        async ({ page, entry }, use, testInfo) => {
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            if (collectCoverage) {
                await page.coverage.startJSCoverage({ resetOnNavigation: false });
            }
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
            if (collectCoverage) {
                await addCoverageReport(await page.coverage.stopJSCoverage(), testInfo);
            }
            expect(errors, 'Uncaught browser errors').toHaveLength(0);
        },
        { auto: true },
    ],
});

export { expect, test };
