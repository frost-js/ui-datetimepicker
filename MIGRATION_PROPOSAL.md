# DateTimePicker 4 migration proposal

Prepared 30 September 2026. Proposed release: **`@fr0st/ui-datetimepicker` 4.0.0**, upgrading from 3.0.2.

The migration should adopt Frost UI 4's component model, distribution, tooling, documentation, and browser testing conventions while retaining the picker's documented functionality. Updating dependency versions alone will not work: UI's base component and modal APIs have changed, and DateTime 8 removed the date setters this project calls.

The initial review was proposal-only. The implementation status below records subsequent work; the numbered sections retain the full migration plan and original findings.

## Implementation status — 1 October 2026

Numbers refer to the main sections below. Section 9 summarizes acceptance and does not define a separate numbering scheme.

| Section | Status |
| --- | --- |
| 1. Dependencies and package metadata | Committed in `c044075`: 4.0.0 metadata and lockfile, runtime peers, `.npmrc`/`.gitignore`, and shared lint configuration. |
| 2. Vite and distribution | Committed in `c044075`: Vite ESM/UMD builds, source maps, and `browser.js`. |
| 3. JavaScript component migration | Committed in `c044075` and `b178ee9`: UI 4/DateTime 8 APIs, private class state, form reset synchronization, owned-resource cleanup, transition guards, modal draft/focus handling, accessibility states, and selection fixes. Section 5 adds a regression fix for duplicate modal Set dismissal. |
| 4. Sass and styling | Committed in `b178ee9`: Sass modules, UI-prefixed CSS variables, current UI color tokens, logical RTL styles, and the matching 992px wide-layout breakpoint. |
| 5. Playwright and Codecov | Implemented: reference-style method/event/option suites and separate form/modal/format/style files, deterministic browser clock, source-mapped Monocart reports and Codecov configuration. All 204 cases pass in Chromium, Firefox, and WebKit (612 total). |
| 6. CI and publishing | Implemented: Node 20/22/24 and Chromium/Firefox/WebKit CI matrix, OIDC coverage upload, and a release-triggered npm provenance workflow. Remote service configuration remains to be verified before release. |
| 7. README and demos | Pending. |

Validation recorded for commit `c044075`: build, JavaScript/SCSS lint, Sass-unused audit, and package-content inspection passed. **43 tests passed in each of Chromium, Firefox, and WebKit (129 total)**, including all four JavaScript bundle variants. This result predates the section 3–4 changes in `b178ee9`. Node 20/22 matrix runs remain part of later CI work; local validation used Node 24.

Section 5–6 validation: **612 browser tests pass** on Node 24 with no skipped tests or retries. JavaScript/SCSS lint, the Sass-unused audit, workflow/Codecov YAML parsing, and `npm pack --dry-run` pass. The package contains all 12 distribution artifacts and excludes tests, reports, and workflows. The suite uses locator assertions for DOM behavior and contains no object-shape `.toEqual()` assertions or arbitrary timeout waits. It does not duplicate UI's light/dark theme tests.

A clean `npm ci --offline` from the populated npm cache also passed. All 12 tracked distribution files rebuilt byte-for-byte identically afterward, and a subsequent Chromium coverage run passed all 204 tests. Monocart reports **95.32% source lines, 94.12% statements, 87.52% branches, and 97.92% functions**. The LCOV export counts executable lines separately: **1,420 / 1,509 (94.10%)**, within the configured 95% target's five-percentage-point allowance. Reports are generated at `coverage/index.html` and `coverage/lcov.info`; the only source exclusion is the erased `browser.js` re-export, matching SelectMenu. Actual Codecov service status awaits the first CI upload.

Implementation decisions and remaining notes:

- Runtime peers are UI 4.0.0, fQuery 5.0.0, and DateTime 8.1.3. `npx sort-package-json` was run. `postcss-cli` remains on 11 to preserve UI's Node baseline.
- The shared three-day release-age policy rejected Sass 1.105.1 at installation time. The manifest uses `sass-embedded: ^1.105.0` and `vite: ^8.3.0`; the lockfile resolved Sass 1.105.0 and Vite 8.3.1.
- The coverage manifest uses `monocart-reporter: ^2.13.1`, locked to 2.13.1. Registry metadata checked on 1 October shows 2.14.0 was published on 29 September at 16:37 UTC, so it is not yet eligible under the same three-day policy. No release-age exception was added.
- Fixed multi-date clearing, numeric epoch zero, constructor string bounds with a derived format, invalid Date/DateTime/numeric inputs, format-cache hour-cycle collisions, explicit 12/24-hour formats, and unsafe stepping. Invalid `minuteStepping` now throws a `RangeError` for values outside integer 1–60; multi-date setters require an array or null and reject scalar input with a `TypeError`.
- Strings intentionally use the configured format and `altFormats`. The ineffective general-string fallback was removed; ISO strings require a matching configured format or conversion to a Date/DateTime before calling the picker.
- Invalid stepping and unsupported formats release the base registration when initialization fails. Constructor-callback and lifecycle cleanup is included in `b178ee9`.
- The test server defaults to port 3001 and accepts a `PORT` override consistently in the server and Playwright configuration. Port 3001's initial availability check was slow in this environment; the remaining checks used `PORT=34567`.
- Section 4 replaces Sass `@import` with `@use`/`@forward`, removing that deprecation warning.
- Additional issues encountered during section 3: returning input focus after hiding could reopen the popup; an opening input click could reach UI 4's modal backdrop handler and immediately close the modal. Commit `b178ee9` corrects focus ordering and stops propagation of modal-opening clicks.
- Section 5 found and fixed **duplicate modal Set dismissal**: Set had both a picker click handler and `data-ui-dismiss="modal"`. A canceled first hide was followed by UI's second hide, discarding the draft. Set now uses only the picker handler; Cancel retains UI's dismiss attribute.
- **Inherited UI 4 focus-trap limitation:** forward Tab from a modal at the end of the document can move focus to browser chrome when there is no following page control. UI's trap redirects `focusin` from outside page controls but does not intercept this browser-boundary case. Reproduced in Chromium; the integration suite verifies forward/reverse redirection between page controls and nested-modal focus restoration. Fixing UI's shared focus trap is outside this repository's scope.
- The clean install reports deprecated transitive development dependencies: `clean-css-cli → glob@7 → inflight`. This comes from the CSS minifier also used by the reference projects; no dependency override or minifier replacement was introduced in sections 5–6.

Section 6 release setup still requires the repository owner to verify Codecov activation for `elusivecodes/FrostUI-DateTimePicker` and configure npm trusted publishing for `@fr0st/ui-datetimepicker` with repository `elusivecodes/FrostUI-DateTimePicker` and workflow `publish.yml`. The workflows use OIDC; no static publishing token was added. Workflow execution, Codecov upload, and npm publication have not been performed locally.

## Reference projects and precedence

| Reference | Apply to this project |
| --- | --- |
| [`../ui`](../ui) | Primary authority: component lifecycle, public `node`/`options`, frozen options, styling, browser support, scripts, CI, README and demo conventions. |
| [`../ui-authcodeinput`](../ui-authcodeinput) | Extension packaging, private class members, option typedefs, form reset/disposal, browser test organization, and demo assets. |
| [`../FrostUI-SelectMenu`](../FrostUI-SelectMenu) | Closest styled extension: Vite ESM/UMD outputs, Sass pipeline, popup/form/style tests, local asset server, source coverage, and bundle freshness checks. |
| [`../datetime`](../datetime), [`../fquery`](../fquery) | Actual date, DOM, event, and animation contracts used by the picker. |
| [`../component`](../component) | Supporting package/export and testing conventions; do not introduce a component/state dependency into this picker. |

`../ui-selectmenu` does not exist in this checkout; `../FrostUI-SelectMenu` is the available SelectMenu reference. Its manifest already identifies `@fr0st/ui-selectmenu` 4.0.0. Where reference projects differ, use UI's public contract and SelectMenu's extension-specific infrastructure, with differences documented below.

## 1. Dependencies and package metadata

### Runtime dependencies

Declare the following in **both `peerDependencies` and `devDependencies`**, following AuthCodeInput and SelectMenu. Externalize all three in both JavaScript build modes.

| Package | Proposed range | Verified npm `latest` |
| --- | --- | --- |
| `@fr0st/ui` | `^4.0.0` | 4.0.0 |
| `@fr0st/query` | `^5.0.0` | 5.0.0 |
| `@fr0st/datetime` | `^8.1.3` | 8.1.3 |

Versions were checked against the public npm registry on the preparation date: [UI metadata](https://registry.npmjs.org/@fr0st%2Fui/latest), [fQuery metadata](https://registry.npmjs.org/@fr0st%2Fquery/latest), and [DateTime metadata](https://registry.npmjs.org/@fr0st%2Fdatetime/latest). The current package imports these libraries but declares none of them.

### Development dependencies

Use these compatible targets, refreshing registry metadata and checking release-age eligibility when implementation begins. Commit the resulting `package-lock.json`; CI must install with `npm ci`.

| Package | Proposed range | Notes |
| --- | --- | --- |
| `@fr0st/eslint-config` | `^5.0.3` | Shared Frost configuration. |
| `@fr0st/stylelint-config` | `^4.0.2` | Shared Frost SCSS configuration. |
| `@playwright/test` | `^1.63.0` | Browser tests. |
| `autoprefixer` | `^10.6.1` | Retain CSS prefixing. |
| `clean-css-cli` | `^5.6.3` | Retain CSS minification. |
| `eslint` | `^10.11.0` | Latest verified patch. |
| `find-unused-sass-variables` | `^6.2.1` | Match UI's Sass audit script. |
| `monocart-reporter` | `^2.14.0` | Source-mapped coverage; newer than the checked-out references. |
| `postcss` | `^8.5.28` | Retain CSS processing. |
| `postcss-cli` | `^11.0.1` | Explicit compatibility exception; see below. |
| `sass-embedded` | `^1.105.1` | Replace `sass`; retains the `sass` CLI. |
| `stylelint` | `^17.15.0` | Latest verified version. |
| `vite` | `^8.3.1` | Replace direct Rollup/Terser JavaScript builds. |

All listed targets except `postcss-cli` were npm's `latest` when checked. Remove `rollup`, `@rollup/plugin-node-resolve`, `terser`, and `sass` once their replacement pipeline works.

**Recommended compatibility decision:** retain UI's Node engine range, `^20.19.0 || ^22.13.0 || >=24`, and `postcss-cli` 11.0.1. The latest [postcss-cli 12.0.0](https://registry.npmjs.org/postcss-cli/latest) requires Node `>=22`. Adopting it would require deliberately dropping Node 20 from this project's engine range and CI, diverging from UI. All three main dependencies can be upgraded to their latest versions without that exception affecting runtime functionality.

### Manifest changes

- Set `version` to `4.0.0`; keep the existing package name.
- Rewrite the description and keywords around locale-aware date/time selection, multi-date input, inline calendars, and modal selection.
- Use `author: "Elusive <elusivecodes@gmail.com>"`, `private: false`, `type: "module"`, `publishConfig.access: "public"`, the Node engine range above, and `browserslist: ["baseline newly available"]`.
- Set `main` and `module` to `./dist/frost-ui-datetimepicker.esm.js`.
- Set `jsdelivr` and `unpkg` to `./dist/frost-ui-datetimepicker.min.js`.
- Add `exports["."]` with `import` and `default` pointing to the ESM bundle, plus `./dist/*` and `./src/*` exports.
- Retain `files: ["dist", "LICENSE", "README.md", "src"]`. Verify that test fixtures, demos, coverage, and this proposal are absent from the packed package.
- Preserve the repository's actual URLs unless its transfer to `frost-js/ui-datetimepicker` is verified. The SelectMenu reference also retains its existing repository identity; do not invent a new destination.
- Do not mark the package `sideEffects: false`: importing its entry registers the component and event handlers.
- Finish manifest editing with **`npx sort-package-json`**, then refresh and commit the lockfile. The currently published sorter is 4.0.0 and requires Node 22+, so run this maintenance command on Node 24; it does not need to become a runtime or development dependency.

### Repository configuration

Add `.npmrc` matching SelectMenu, including the picker-specific DateTime exception:

```ini
min-release-age=3
min-release-age-exclude[]=@fr0st/eslint-config
min-release-age-exclude[]=@fr0st/stylelint-config
min-release-age-exclude[]=@fr0st/core
min-release-age-exclude[]=@fr0st/query
min-release-age-exclude[]=@fr0st/ui
min-release-age-exclude[]=@fr0st/datetime
```

Update `.gitignore` to UI's grouped entries: `node_modules/`, `.tmp/`, `coverage/`, `playwright-report/`, and `test-results/`. Keep `dist/` and `package-lock.json` tracked. Do not copy unrelated package overrides from UI without evidence that this project needs them.

Update ESLint to the reference's `frostConfig`, `browserConfig`, and scoped `nodeConfig` pattern. Ignore generated output and reports; declare `$`, `UI`, and `DateTime` only where browser tests use those globals. Retain the shared Stylelint configuration.

## 2. Vite and distribution

Replace `rollup.config.js` with `vite.config.js`, based on [SelectMenu's configuration](../FrostUI-SelectMenu/vite.config.js). Use Vite 8's `build.rolldownOptions`, consistent with the [current Vite build configuration](https://vite.dev/config/build-options.html).

| Mode | Entry | Outputs |
| --- | --- | --- |
| Default / ESM | `src/js/index.js` | `frost-ui-datetimepicker.esm.js`, `frost-ui-datetimepicker.esm.min.js` |
| UMD | `src/js/browser.js` | `frost-ui-datetimepicker.js`, `frost-ui-datetimepicker.min.js` |
| CSS | `src/scss/datetimepicker.scss` | `frost-ui-datetimepicker.css`, `frost-ui-datetimepicker.min.css` |

Generate source maps for every output. Rename `wrapper.js` to `browser.js`; retain its named `DateTimePicker` export while the ESM entry retains the default export.

UMD must use `name: 'UI'`, `extend: true`, and globals `@fr0st/query → fQuery`, `@fr0st/ui → UI`, and `@fr0st/datetime → DateTime`. Loading the extension must preserve existing UI exports. Do not introduce a dependency-inclusive picker bundle; the reference extensions externalize their host libraries.

Use `target: 'baseline-widely-available'`, source maps, and paired unminified/minified outputs as in SelectMenu. Clear `dist` only for the first JavaScript build. Run JavaScript before CSS so Vite does not delete newly generated styles.

Adopt these script names and relationships:

```text
build             → npm run build:js && npm run build:css
build:js          → vite build && vite build --mode umd
build:css         → npm run compile:css && npm run autoprefix:css && npm run minify:css
compile:css       → existing expanded Sass + embedded-source map command
autoprefix:css    → postcss --replace dist/frost-ui-datetimepicker.css
minify:css        → existing clean-css command and source-map options
lint              → npm run lint:js && npm run lint:css
lint:js           → eslint
lint:css          → stylelint "src/scss/**/*.scss"
lint:sass:unused  → fusv src/scss
test              → npm run build && npm run test:browser
test:browser      → playwright test --forbid-only
test:coverage     → playwright test --config=playwright.coverage.config.js --forbid-only
test:headed       → playwright test --forbid-only --headed
test:ui           → playwright test --ui
```

Smoke-test both minified and unminified ESM/UMD outputs in browsers, including registration through fQuery and preservation of `UI.Modal`. For direct browser ESM, use an import map covering `@fr0st/core`, `@fr0st/query`, `@fr0st/ui`, and `@fr0st/datetime`; fQuery's ESM dependency on core must resolve too.

## 3. JavaScript component migration

### Class structure and lifecycle

- Consolidate `prototype/events.js`, `prototype/helpers.js`, and `prototype/render.js` into actual methods of `DateTimePicker`. Remove prototype assignment/composition from `index.js` and delete `src/js/prototype/`.
- Declare component-owned state as `#private` fields and implementation methods as `#private` methods. Use inherited `this.node` and `this.options`; do not redeclare or write the base class's state.
- Move `defaults`, `classes`, `lang`, and `icons` into static class fields. Preserve these public customization surfaces.
- Preserve the public static `getDefaultDateFormat`, `getDefaultTimeFormat`, and `getDefaultFormat` helpers as class methods. Retain pure format/comparison functions in ordinary modules where useful.
- Remove `src/js/static/` composition too. Move render helpers into private methods, or ordinary functions with explicit arguments for classes/icons. No helper should require an implicitly bound component `this`.
- Keep `index.js` focused on `initComponent('datetimepicker', DateTimePicker)` and component registration/events. Document listeners must use public DOM/instance interfaces or deliberate class handler methods; they cannot reach private fields.
- Keep options frozen. Resolve format, locale/time zone, modal/inline precedence, and mobile mode into derived private values before parsing dates. Do not assign to `this.options.format` or `this.options.modal`.
- Keep the native input as the submitted value and the owner of the instance. Preserve registration reuse and fQuery's first-result behavior.
- Make disposal safe during animation and event callbacks. Cancel owned work, remove only owned event handlers, release Popper/Modal resources, remove generated DOM, restore changed input attributes/styles, and call `super.dispose()`.
- Synchronize native `change` and form reset with stored dates, the displayed view, and inline calendars. Observe canceled resets, wait for the native reset action, and remove the reset handler/timer on disposal, following the form components.

### DateTime 8 integration

Replace the removed DateTime instance setters throughout events, rendering, and helpers:

| Old DateTime call | DateTime 8 call |
| --- | --- |
| `setYear(year, month?, date?)` | `withYear(year, month?, date?)` |
| `setHours(...)` | `withHours(...)` |
| `setMinutes(...)` | `withMinutes(...)` |
| `setWeekDay(day)` | `withWeekDay(day)` |
| `setTimestamp(timestamp)` | `withTimestamp(timestamp)` |

Keep the picker's own public `setDate`, `setMinDate`, and `setMaxDate` names. DateTime numbers are UNIX seconds, array months are 1-based, and returned DateTime values are immutable. Preserve and document those contracts.

Normalize null/empty input separately from numeric zero, and validate dates from every accepted input type. Establish the effective format before parsing string bounds. Define string parsing as configured format followed by `altFormats`; document whether ISO input is supported and add an explicit fallback only if it is part of the intended public contract.

Make multi-date clearing, filtering, sorting, deduplication, and selection/removal use consistent displayed granularity. Keep multi-date mode date-only. Validate `minuteStepping` before using it in loops; a finite positive integer in the supported range is required.

Use deterministic locale/time-zone behavior, with tests for locale week starts, month/year boundaries, leap days, daylight-saving gaps/overlaps, and time-only values. Review precision intentionally: timestamp-based comparisons currently discard milliseconds, whereas bounds and DateTime objects can carry them.

### Modal, popup, accessibility, and events

Replace `modal._activeTarget = ...` with `modal.show(relatedTarget)`. Test popup-inside-modal and picker-modal-inside-modal behavior against UI's focus trap, Escape handling, backdrop, and scroll cleanup.

Use explicit open/transition state instead of treating DOM connection alone as visibility. Support interruption safely and guard work after cancellable callbacks or user listeners that dispose the instance. Prefer the current UI transition/reduced-motion conventions where applicable; audit the hard-coded 100 ms date/time view transitions too.

Retain event names `show`, `shown`, `hide`, `hidden`, `change`, and `refresh` under `.ui.datetimepicker`, including cancellation and documented payloads. Modal selection should have a clear draft/commit contract: Cancel restores the original selection; Set commits once with accurate old/new dates.

Give the input and popup an appropriate accessible relationship, a named dialog, and correct expanded state. Use `aria-modal="true"` only for the actual modal. Retain calendar keyboard navigation, roving focus, localized labels, disabled states, and focus return. Correct selection semantics consistently: either real buttons with `aria-pressed`, or an intentionally implemented grid using `aria-selected`; do not retain `aria-selected` on arbitrary button roles.

### JSDoc

Follow the reference's `DateTimePickerOptions` typedef plus `@augments {BaseComponent<DateTimePickerOptions>}` pattern. Describe every option, callback signature, public/static method, event detail shape, and private helper with useful parameter/return types. Correct existing getter documentation: `getMinDate()` and `getMaxDate()` return `DateTime|null`, while `getDate()` returns `DateTime|null|DateTime[]`. Include nullable inputs for clearing and distinguish one date's numeric tuple from an array of selected dates.

## 4. Sass and styling

- Rename `src/scss/vars.scss` to `_vars.scss`; replace `@import "vars"` with `@use "vars"` and qualify variables. Retain `!default` customization and document `@use ... with (...)` overrides.
- Follow SelectMenu's `--ui-<component>-*` convention for owned CSS variables, replacing current `--datetimepicker-*` names with `--ui-datetimepicker-*`. List this change in the 4.0 migration notes.
- Audit UI 4 color roles. Use its active/hover/highlight and contrast tokens consistently; assess `--ui-primary-highlight` for active hover instead of mechanically retaining `--ui-primary-emphasis`.
- Use logical alignment/positioning for RTL where appropriate (`text-align: start`, logical position for the today marker). Check Popper placement with RTL and alternate containers.
- Resolve the existing wide-layout mismatch: CSS widens at 768 px, but the rendered columns use `row-cols-lg-2`. Prefer one coherent breakpoint matching UI's grid.
- Verify tables, navigation, focus indicators, disabled styling, modal sizing, inline layout, and filled/outline inputs with current UI CSS. Keep custom Sass compilation, prefixing, minification, and source maps.

The picker has its own component styles but no separate light/dark palette or theme selector rules. Use UI tokens to inherit themes; **do not add duplicate light/dark test matrices**. If implementation introduces picker-specific theme branches, test those branches specifically. A shared theme selector in the demo remains useful and follows the references.

## 5. Playwright and Codecov

### Harness and configuration

Copy the reference layout, adapted to this package:

```text
playwright.config.js
playwright.coverage.config.js
test/package.json                   # imports: { "#test": "./support/test.js" }
test/support/test.js
test/support/app/index.html
test/support/server/static-server.js
test/setup/browser.js
test/browser/date-time-picker.test.js
test/browser/date-time-picker-form.test.js
test/browser/date-time-picker-style.test.js
test/browser/date-time-picker-modal.test.js
test/browser/date-time-picker-format.test.js
.github/codecov.yml
```

Use Chromium, Firefox, and WebKit; retain the reference's localhost static server, reduced-motion setting, and automatic `uiPage` fixture. Serve built picker JS/CSS and installed UI/DateTime assets from explicit local routes, with no CDN or sibling-directory dependency in CI. Assert fixture registration and stylesheet readiness before tests run.

Install a stable clock before page initialization for date-sensitive cases, using a useful calendar date rather than relying on today. Fix locale and time zone explicitly per scenario. Advance the fake clock only for tests that exercise animation/timers; avoid arbitrary `waitForTimeout` calls.

### Describe grouping and order

Follow the actual `#test` imports, `test.describe`, fixture setup, direct browser interactions, and method-first order in [AuthCodeInput](../ui-authcodeinput/test/browser/auth-code-input.test.js) and [SelectMenu](../FrostUI-SelectMenu/test/browser/select-menu.test.js).

The primary file should have an outer `test.describe('DateTimePicker', ...)`, followed by:

1. `#init`, then `#dispose`.
2. Public method groups: `#clear`, `#disable`/`#enable`, getters, `#setDate`, bound setters, `#refresh`, `#show`/`#hide`/`#toggle`, and `#update`.
3. `events`, then `user events` with keyboard/focus subgroups.
4. Named option groups, using labels such as `multiDate option`, `minuteStepping option`, `keepInvalid option`, and `renderDay option`.

Parameterize class and QuerySet variants inside the relevant method groups as SelectMenu does. Cover UI's multiple-node/first-result behavior; avoid duplicating whole suites for each API style. Add a focused `QuerySet` group only for behavior not already exercised through those variants.

Separate forms, styles, modal integration, and locale/format scenarios into the files above when they benefit from distinct setup, following SelectMenu's separate form/style files. Keep the main component's method/event/option progression intact.

### Required coverage

| Area | Behaviors to verify |
| --- | --- |
| Initialization | Class and QuerySet creation/reuse; default/data/explicit option precedence; frozen options; initial valid/invalid/empty input; `useCurrent`; invalid construction cleanup. |
| Methods | All public methods, null clearing, numeric zero, bounds removal/change, array and Date/DateTime inputs, copied multi-date arrays, disabled/readonly behavior, and no-op operations. |
| Selection | Day/month/year views; prev/next; hour/minute grids; 12/24-hour display; stepping and rollover; multi-date add/remove/deduplication; custom validation/render callbacks. |
| Events | Cancellation, ordering/counts, change payload scalars, refresh view information, native input/change synchronization, and disposal from listeners. |
| User interaction | Pointer opening, outside dismissal, Enter/Space, arrows, Home/End/PageUp/PageDown, modifier navigation, Escape, Tab/Shift+Tab, roving focus and focus return. |
| Formats and limits | Default/alternate formats, quoted literals, AM/PM cache behavior, explicit format versus locale, locale week starts, time zones/DST, leap days, inclusive bounds, invalid dates, time-only formats. |
| Forms | Submitted value, required/native validation, reset and canceled reset, disabled fieldsets, readonly/ignoreReadonly, inline input accessibility, and cleanup/restoration. |
| Modal | Draft selection, Set/Cancel, canceled hide, opening by keyboard, nested UI modal, focus trap/restoration, Escape/backdrop behavior, and disposal while open/transitioning. |
| Styles | Component-owned sizing, matching wide-layout breakpoint, inline/sideBySide/vertical, toolbar/close controls, focus/disabled/selected styling, RTL, appendTo and placement. No generic UI theme suite. |
| Distribution | ESM and UMD load/register correctly; minified builds work; global UI exports remain intact; import maps resolve external dependencies. |

Use locators and web-first assertions: `toHaveValue`, `toHaveText`, `toHaveAttribute`, `toHaveClass`, `toHaveCount`, `toHaveCSS`, `toBeVisible`, `toBeHidden`, `toBeEnabled`, `toBeDisabled`, and `toBeFocused`. For example, assert the input's value and selected date's accessible state after clicking that date.

Do **not** gather a large object of DOM facts with `page.evaluate()` and compare it using `.toEqual()`. Use browser evaluation to initialize/call the public API or inspect non-DOM return values, with focused scalar assertions. Use `expect.poll` for asynchronous API observations where needed. Never assert private fields or serialized DateTime internals.

### Coverage reporting

Adapt [SelectMenu's coverage configuration](../FrostUI-SelectMenu/playwright.coverage.config.js) and fixture. Start Chromium V8 coverage before navigation, collect through Monocart, filter entries to this picker's unminified UMD asset, and resolve its map to `src/js/`.

Generate console, HTML, and `coverage/lcov.info` reports. Include unexecuted source files with `all: './src/js'`; exclude dependencies and generated code. As in the reference, exclude the re-export-only `browser.js` from source coverage if bundling erases it; do not broaden exclusions to hide untested behavior.

Use `.github/codecov.yml` with project target `95%`, threshold `5%`, `if_ci_failed: error`, and informational patch coverage. These are proposed gates, not a claim that current coverage exists. Cover behavioral branches rather than padding coverage with object-shape tests.

## 6. CI and publishing

Adapt [SelectMenu's CI](../FrostUI-SelectMenu/.github/workflows/ci.yml), matching UI's supported matrix:

| Node | Browser | Run |
| --- | --- | --- |
| 20 | Chromium | Browser tests |
| 22 | Chromium | Browser tests |
| 24 | Chromium | Browser tests with coverage |
| 24 | Firefox | Browser tests |
| 24 | WebKit | Browser tests |

Use the references' push-to-main and pull-request triggers and Markdown-only path exclusions. Steps: checkout, setup Node with npm cache, `npm ci`, install the required Playwright browser with OS dependencies, lint, build, test, verify all `dist` output is tracked/current, and `npm pack --dry-run`.

Use the current reference actions (`actions/checkout@v6`, `actions/setup-node@v6`, `codecov/codecov-action@v7`). Upload coverage only from the Node 24/Chromium job using OIDC, `files: ./coverage/lcov.info`, `disable_search: true`, and `fail_ci_if_error: true`. Configure Codecov for the actual repository and grant that job `id-token: write`.

Add a release-triggered `publish.yml` following UI/AuthCodeInput/SelectMenu: Node 24, clean install, Chromium, lint/build/tests, generated-bundle check, package inspection, then `npm publish --provenance`. Configure npm trusted publishing for the actual repository/workflow before releasing. Workflow creation does not itself publish a release.

## 7. README and demos

Rewrite README in the reference order: badges and concise introduction, Highlights, Installation, Usage, Options, Data attributes, Methods, Events, fQuery API, Accessibility, Forms/reset, Themes and RTL, Development, and License. Include a 3.x → 4.0 migration section.

Document:

- npm/bundler usage, direct browser ESM with the complete import map, and UMD script order: UI bundle, DateTime, then picker. Load UI CSS before picker CSS.
- Every actual option/default, callback signature, method return type, and event detail; replace the current promise of future documentation.
- Locale/time-zone behavior, supported formats, accepted date input types and units, min/max inclusivity, stepping, `keepInvalid`, and multi-date separators.
- Popup, inline, modal, mobile modal, date-only, time-only, month/year, toolbar, side-by-side, validation, and rendering examples.
- Native form submission/reset and accessibility/keyboard behavior, including limitations actually verified by tests.
- Public static customization, Sass configuration, CSS variable renames, removal of underscore internals, the new built ESM entry, Node/tooling requirements, and DateTime's `with*` API for consumers using returned dates.

Replace the duplicate `demo/light/demo.html` and `demo/dark/demo.html` with `demo/index.html` plus `demo/assets/demo.css` and `demo/assets/demo.js`. Use the same navbar, hero, cards, spacing, theme control, and section navigation as the reference extension demos. Consolidate methods/events demonstrations into a usable API section with live output; preserve their functionality. Either retain old demo URLs as small redirect pages or document their replacement explicitly.

Use current npm CDN package URLs with compatible majors (`@fr0st/ui@4`, `@fr0st/datetime@8`), and local picker bundles. Avoid the current GitHub `@latest` URLs. Include filled/outline inputs, locales/time zones, multi-date selection, limits, form reset, nested modal integration, inline layouts, and custom render/validation examples. Keep labels and instructions specific to each example.

## 8. Bugs and other issues found

Evidence labels distinguish source-confirmed incompatibilities from narrow executable reproductions and browser cases still needing confirmation. Fix confirmed blockers during migration and add regression coverage for each behavior below.

| Priority | Finding and evidence | Proposed handling |
| --- | --- | --- |
| Blocker | **UI 4 base-class incompatibility.** `date-time-picker.js` reads `_node`/`_options` and mutates options. UI 4 exposes `node`/`options` getters and freezes options. Confirmed from both implementations. | Migrate access and store derived configuration privately. A mechanical underscore-to-getter rename is insufficient. |
| Blocker | **DateTime setters removed.** Events/helpers/rendering call `setYear`, `setHours`, `setMinutes`, `setWeekDay`, and `setTimestamp`. Direct checks against local DateTime 8.1.3 show those methods are undefined and the corresponding `with*` methods exist. | Replace all calls and test the affected selection/navigation paths. |
| High | **Undeclared runtime libraries.** `package.json` has no runtime peers despite importing and externalizing UI, fQuery, and DateTime. Confirmed manifest/build inspection. | Declare peers and local development copies; verify a clean package consumer. |
| High | **Multi-date clear throws.** `clear()` calls `setDate(null)`; `_parseDates(null)` returns null and `_setDates` calls `.filter()` on it. Reproduced with the helper functions. | Normalize clearing to `[]`; define handling of invalid/non-array multi-date inputs. |
| High | **String bounds are parsed too early.** The constructor parses min/max before resolving a null default format. A focused call with `format: null` returns null for a valid date string. | Resolve formats first; test constructor bounds without an explicit format. |
| High | **Invalid minute stepping can prevent loop progress.** `_renderMinutes()` advances by unchecked `minuteStepping`; zero/negative values can keep the loop running indefinitely. Confirmed control-flow defect, not executed as a hanging browser case. | Reject invalid stepping before rendering; cover zero, negative, non-finite and unsupported values. |
| High | **Inline disposal does not restore the input.** `_render()` calls `$.hide(this._node)`; `dispose()` does not restore its previous display. Confirmed source omission; browser regression pending. | Capture and restore only the visibility/style state owned by the picker. |
| High | **Modal disposal leaves its generated wrapper.** `dispose()` disposes the Modal instance and removes the menu but never removes the generated modal element. UI Modal disposal cleans its resources, not the caller-owned element. Confirmed source ownership mismatch. | Remove the owned modal DOM, including disposal while shown. |
| High | **Modal focus relies on a removed private member.** `show()` writes `modal._activeTarget`, but UI 4 uses `#activeTarget` and `show(relatedTarget)`. Confirmed API mismatch. | Use the public argument and assert actual focus restoration. |
| Medium | **UNIX epoch is discarded.** `_parseDate` starts with `if (!date)`, so numeric `0` returns null. Reproduced. Constructor min/max/default checks also use truthiness. | Distinguish missing input from valid zero through every path. |
| Medium | **General string fallback is ineffective.** `_parseDate` expects `_makeDate` to throw, but `_makeDate` catches parse failures and returns null. A valid ISO string outside the configured format returns null in a focused reproduction. | Make the accepted string contract explicit; implement/test a deliberate fallback if supported. |
| Medium | **Hour-cycle cache ignores an argument.** Format caches are keyed only by locale, despite accepting `hasDayPeriod`. Calling the same locale with true then false returns the first cached pattern. Reproduced with `getDefaultTimeFormat`. | Key all relevant inputs and make the formatter's hour-cycle options consistent with the requested mode. |
| Medium | **Displayed hour cycle follows locale, not explicit format.** `_useDayPeriod` is derived from locale even for a user-supplied `HH:mm` or `hh:mm a` format. Confirmed decision path; browser presentation regression pending. | Respect explicit format tokens and use locale only for defaults. |
| Medium | **Multi-date removal uses inconsistent granularity.** The date handler checks whether a year/month is selected at year/month granularity, but removes with `isSameDay`. Confirmed source mismatch; reproduce with DateTime inputs on different days of the same displayed month/year. | Use the same comparison granularity for add/remove/deduplication. |
| Medium | **No form reset synchronization.** There is no reset listener; native reset can change the input while stored dates and inline UI remain stale. Confirmed absence; browser regression pending. | Follow AuthCodeInput/SelectMenu's reset lifecycle, including canceled resets. |
| Medium | **Accessibility semantics are incomplete.** Nonmodal popup markup sets `aria-modal=true`; generated dialogs lack a name relationship; selected button-role cells use `aria-selected`; disabled hour/minute/month/year items do not consistently expose `aria-disabled`. Confirmed markup inspection. | Correct roles, names, state and focus behavior, verified with accessible locators. |
| Medium | **Responsive breakpoints disagree.** Picker width changes at 768 px while `row-cols-lg-2` changes columns at UI's large breakpoint. Confirmed CSS/class mismatch. | Align the breakpoints and test immediately below/above the chosen value. |
| Review | **Transition/disposal and callback reentrancy.** Fade/squeeze continuations access state that `dispose()` nulls, some promises lack rejection handling, and opening/hiding uses connection/animation checks. Risk identified from source; full timing reproduction pending. | Test interruption, rapid toggles, and disposal from lifecycle/change/refresh callbacks; cancel or invalidate stale work. |
| Review | **Default-time search skips possible valid times.** Constructor/date selection scan in hard-coded five-minute increments regardless of configured stepping or narrow `isValidTime` windows. Source-confirmed limitation; browser outcomes need tests. | Search at the supported selectable precision and handle a day with no valid time explicitly. |
| Low | **Documentation/build maintenance debt.** README lacks the API, demos use old repository/CDN paths, Sass uses deprecated `@import`, there is no test/CI harness, and the modal Set button carries unrelated `data-ui-set-color`. Confirmed inspection. | Address through the build, docs, demo, Sass and cleanup work above. |

The narrow executable checks imported the current pure format/helpers code with minimal fQuery type-check stubs and the sibling DateTime source. They confirm those helper results, not end-to-end browser behavior. No full application tests or migrated build have been run during this proposal-only review.

Additional regression targets, without claiming confirmed defects: preserving invalid DateTime validity when copying, modal change-event old/new values after draft edits, minute rollover near bounds, constructor exceptions leaving registered instances, and native change-event counts.

## 9. Implementation sequence and acceptance

Implement the main sections in their numbered order:

- **Sections 1–2:** dependency/package configuration and Vite distribution.
- **Section 3:** JavaScript migration, behavior, and integration fixes.
- **Section 4:** Sass, UI tokens, and component layout.
- **Section 5:** Playwright behavioral suites and source-mapped Codecov reporting.
- **Section 6:** CI and publishing configuration.
- **Section 7:** README and demos, followed by final release validation against the criteria below.

The migration is complete when:

- A clean install builds all ESM/UMD/CSS variants and source maps, with correct exports and external peers; no legacy Rollup/Terser pipeline or prototype/static composition remains.
- `npx sort-package-json`, lint, build, Sass-unused audit, browser tests in the stated matrix, and Chromium coverage have been run successfully. Coverage maps to authored picker source and satisfies the configured project policy.
- Confirmed bugs have regression tests; any unresolved investigation is documented honestly with its impact.
- Package consumption works independently of sibling checkouts; `npm pack --dry-run` contains the intended files, and rebuilding leaves tracked `dist` clean.
- README examples and demos work against the declared dependency majors and cover the component's actual supported behavior.
- CI and release workflows use the correct repository/package identity; Codecov and npm trusted publishing are configured before the release is published.

Expected breaking changes are the dependency majors and supported toolchain, built ESM package entry/exports, removal of underscore internals/prototype composition, CSS variable/Sass import changes, and any explicitly documented correction to invalid-input behavior. Preserve existing public picker method names, registration key, event namespace, class customization, and selection modes wherever they remain compatible with UI 4.
