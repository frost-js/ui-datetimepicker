import process from 'node:process';
import { test as base, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';
import { setupClock } from '../setup/browser.js';

const collectCoverage = process.env.FROST_UI_DATETIMEPICKER_COVERAGE === 'true';

const test = base.extend({
    expectedBrowserErrors: [[], { option: true }],
    entry: ['/', { option: true }],
    pickerDefaults: [{}, { option: true }],
    uiPage: [
        async ({ page, entry, expectedBrowserErrors, pickerDefaults }, use, testInfo) => {
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));

            if (collectCoverage) {
                await page.coverage.startJSCoverage({
                    resetOnNavigation: false,
                });
            }

            await setupClock(page);

            await page.goto(entry, {
                waitUntil: 'load',
            });

            await page.waitForFunction(() => window.UI?.DateTimePicker);

            await page.evaluate(() => {
                if (
                    !window.fQuery ||
                    !window.DateTime ||
                    typeof window.fQuery.QuerySet.prototype.datetimepicker !== 'function'
                ) {
                    throw new Error('Failed to initialize DateTimePicker on the test page.');
                }

                // Keep the stylesheet in the head for component layout and transitions.
                document.body.replaceChildren();
            });

            await page.waitForFunction(() => {
                const node = document.createElement('div');
                node.className = 'datetimepicker text-center';
                document.body.append(node);

                const style = getComputedStyle(node);
                const ready = style.width === '300px' &&
                    style.textAlign === 'center';

                node.remove();
                return ready;
            });

            await page.evaluate((defaults) => {
                Object.assign(UI.DateTimePicker.defaults, {
                    duration: 0,
                    locale: 'en-GB',
                    mobileModal: false,
                    timeZone: 'UTC',
                    ...defaults,
                });
            }, pickerDefaults);

            await use();

            if (collectCoverage) {
                const coverage = await page.coverage.stopJSCoverage();
                await addCoverageReport(coverage, testInfo);
            }

            expect(errors, 'Uncaught browser errors').toEqual(expectedBrowserErrors);
        },
        { auto: true },
    ],
});

export { expect, test };
