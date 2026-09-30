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
| 5. Playwright and Codecov | Committed in `769d04e`: reference-style method/event/option suites and separate form/modal/format/style files, deterministic browser clock, source-mapped Monocart reports and Codecov configuration. All 204 cases pass in Chromium, Firefox, and WebKit (612 total). |
| 6. CI and publishing | Committed in `769d04e`: Node 20/22/24 and Chromium/Firefox/WebKit CI matrix, OIDC coverage upload, and a release-triggered npm provenance workflow. Remote service configuration remains to be verified before release. |
| 7. README and demos | Committed in `64100ef`: complete API/options and 3.x migration documentation; npm, browser ESM/UMD, and Sass examples; unified reference-style demo with forms, layouts, validation, methods/events, theme selection; legacy demo pages removed. |
| 8. Bugs and other issues | Audited all original findings against implementation and regression coverage. Added fixes for refresh-callback selection rendering and time-grid validation, plus constructor-failure, strict-parsing, and bound-rounding regressions. Upstream UI limitations and remote release verification are recorded separately below. |

Validation recorded for commit `c044075`: build, JavaScript/SCSS lint, Sass-unused audit, and package-content inspection passed. **43 tests passed in each of Chromium, Firefox, and WebKit (129 total)**, including all four JavaScript bundle variants. This result predates the section 3–4 changes in `b178ee9`. Node 20/22 matrix runs remain part of later CI work; local validation used Node 24.

Section 5–6 validation: **612 browser tests pass** on Node 24 with no skipped tests or retries. JavaScript/SCSS lint, the Sass-unused audit, workflow/Codecov YAML parsing, and `npm pack --dry-run` pass. The package contains all 12 distribution artifacts and excludes tests, reports, and workflows. The suite uses locator assertions for DOM behavior and contains no object-shape `.toEqual()` assertions or arbitrary timeout waits. It does not duplicate UI's light/dark theme tests.

A clean `npm ci --offline` from the populated npm cache also passed. All 12 tracked distribution files rebuilt byte-for-byte identically afterward, and a subsequent Chromium coverage run passed all 204 tests. Monocart reports **95.32% source lines, 94.12% statements, 87.52% branches, and 97.92% functions**. The LCOV export counts executable lines separately: **1,420 / 1,509 (94.10%)**, within the configured 95% target's five-percentage-point allowance. Reports are generated at `coverage/index.html` and `coverage/lcov.info`; the only source exclusion is the erased `browser.js` re-export, matching SelectMenu. Actual Codecov service status awaits the first CI upload.

Section 7 validation: manual browser automation passed in Chromium, Firefox, and WebKit for demo initialization, date/month/year/time/multi-date selection, alternate formats, bounds and validation, modal Set/Cancel, nested-modal focus restoration, form submission/reset, public method controls, and theme preference persistence. The four legacy redirect pages were subsequently removed at the user's request; the unified demo is the only entry point. Desktop and 390px layouts were inspected; no horizontal page overflow was found. The README's complete ESM import map and UMD script examples both initialized and selected dates successfully in Chromium. CDN requests in these checks were served from the installed dependency packages and local picker bundles; this verifies compatibility and asset paths, not live CDN availability or publication of version 4. All 37 option names were checked against the source defaults. The documented Sass module compiled with both custom widths. JavaScript/SCSS lint, demo CSS lint, HTML IDs/label targets/section links, `git diff --check`, and package-content inspection passed. No component source, distribution artifacts, or permanent browser suites changed in section 7; the 612-case result above remains the component regression baseline.

Section 8 validation: **213 tests pass in each of Chromium, Firefox, and WebKit (639 total)** on Node 24, including nine additional cases in the existing reference-style groups. A separate Chromium coverage run passed all 213 tests with no failures, retries, or skipped tests. Monocart reports **95.43% source lines, 94.21% statements, 87.84% branches, and 97.92% functions**; LCOV executable lines are **1,426 / 1,514 (94.19%)**, within the configured project's five-point allowance. Build, JavaScript/SCSS lint, the Sass-unused audit, package-content inspection, and `git diff --check` pass. All four JavaScript maps embed the current picker source, and all 12 distribution artifacts are present. These results supersede the earlier component regression baseline above. The two new defects were reproduced with failing behavioral assertions before their fixes; final validation uses the complete JS/CSS build.

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
- **Inherited UI 4 modal-toggle/backdrop interaction:** under reduced motion, a declarative modal toggle with the default backdrop can open and immediately dismiss the modal when the same click reaches UI's window backdrop listener. Section 7 reproduced the `show → shown → hide → hidden` sequence in Chromium. The nested-modal demo follows SelectMenu's `data-ui-backdrop="static"` example and provides an explicit Close editor button; the shared UI implementation was not changed.
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

Replace the duplicate `demo/light/demo.html` and `demo/dark/demo.html` with `demo/index.html` plus `demo/assets/demo.css` and `demo/assets/demo.js`. Use the same navbar, hero, cards, spacing, theme control, and section navigation as the reference extension demos. Consolidate methods/events demonstrations into a usable API section with live output; preserve their functionality. Remove the old light/dark and methods/events pages; use the unified demo as the only entry point.

Use current npm CDN package URLs with compatible majors (`@fr0st/ui@4`, `@fr0st/datetime@8`), and local picker bundles. Avoid the current GitHub `@latest` URLs. Include filled/outline inputs, locales/time zones, multi-date selection, limits, form reset, nested modal integration, inline layouts, and custom render/validation examples. Keep labels and instructions specific to each example.

## 8. Bugs and other issues found

The original proposal identified 20 findings from source inspection and narrow executable checks. The audit below records their current disposition after sections 1–7 and the section 8 fixes. “Resolved” refers to this repository; the upstream UI limitations and release-service setup remain explicit follow-ups.

Regression references use the existing reference-style groups in [component tests](./test/browser/date-time-picker.test.js), [format/limit tests](./test/browser/date-time-picker-format.test.js), [form tests](./test/browser/date-time-picker-form.test.js), [modal tests](./test/browser/date-time-picker-modal.test.js), [style tests](./test/browser/date-time-picker-style.test.js), and [bundle tests](./test/browser/date-time-picker-build.test.js).

### Original findings audit

| Original priority | Finding | Resolution and evidence |
| --- | --- | --- |
| Blocker | UI 4 base-class incompatibility | **Resolved.** Uses public `node`/`options` getters and private derived state. Component `#init` verifies registration, frozen options, and derived inline/format settings. |
| Blocker | Removed DateTime setters | **Resolved.** Immutable `with*` operations replace removed `set*` calls. Calendar/time mouse and keyboard suites exercise navigation and selection with DateTime 8. |
| High | Undeclared runtime libraries | **Resolved.** UI, fQuery, and DateTime are declared peers plus development dependencies and externalized by Vite. Bundle tests exercise all four ESM/UMD variants; the clean install and package-consumption checks are recorded above. |
| High | Multi-date clear throws | **Resolved.** Clearing normalizes to an empty array; scalar multi-date setters throw deliberately. Component `#clear`/`#setDate` check clearing, invalid-entry filtering, and scalar rejection. |
| High | String bounds parsed before default format resolution | **Resolved.** Formats resolve first. Component `#init` verifies string bounds with the derived locale format. |
| High | Invalid minute stepping can hang rendering | **Resolved.** Accepts only integers 1–60. Component `#init` rejects zero, negative, fractional, non-finite, out-of-range, and string values without retaining registration. |
| High | Inline disposal does not restore the input | **Resolved.** Releases the owned display lock and restores owned attributes. Form disposal tests preserve the original display and unrelated user styles/listeners. |
| High | Modal disposal leaves generated DOM | **Resolved.** Disposes UI Modal and removes owned wrappers. Modal disposal tests exercise lifecycle callbacks and assert wrappers, backdrops, and body locks are removed. |
| High | Modal focus depends on a removed private member | **Resolved.** Uses `Modal.show(input)`. Modal focus tests verify keyboard opening, restored input focus, and nested parent-modal behavior. |
| Medium | UNIX epoch zero discarded | **Resolved.** Missing values are distinguished from numeric zero in selection, bounds, and default view. Component `#init`/`#setDate` cover these paths. |
| Medium | Ineffective general string fallback | **Resolved by an explicit contract.** Strings use `format`/`altFormats`; no general ISO fallback is promised. Format validation now verifies an ISO string is rejected without a matching pattern and accepted/normalized with one. README documents this behavior. |
| Medium | Hour-cycle cache ignores its boolean argument | **Resolved.** Cache keys include the requested cycle. Bundle format tests request both 12- and 24-hour output for the same locale. |
| Medium | Explicit format does not control displayed hour cycle | **Resolved.** Explicit hour tokens drive the controls. Component format-option tests cover `HH:mm` in en-US and `hh:mm a` in en-GB. |
| Medium | Multi-date removal uses inconsistent precision | **Resolved.** Add/remove/deduplication share day/month/year keys. Multi-date option tests toggle values at all three precisions. |
| Medium | No form reset synchronization | **Resolved.** Form reset restores the default selection/view silently, respects canceled resets, and cancels pending work on disposal. Form reset tests cover single/multi-date inputs. |
| Medium | Incomplete accessibility semantics | **Resolved for picker-owned markup.** Named nonmodal dialogs, input relationships, pressed state, disabled state, and roving focus are covered by style, navigation, format, and modal tests. UI's browser-boundary focus limitation remains below. |
| Medium | Responsive breakpoints disagree | **Resolved.** Wide width and UI's two-column layout both switch at 992px. Style tests check 991px and 992px, vertical layouts, and RTL. |
| Review | Transition/disposal and callback reentrancy | **Resolved for the identified paths.** Transition IDs invalidate interrupted animations; owned listeners and pending resets are canceled. Existing event tests cover rapid show/hide/show, disposal during panel animation and lifecycle/change/refresh callbacks, and recursive show. Section 8 additionally fixes stale rendering after a refresh listener replaces the selection, with single-date, multi-date, and time regressions. |
| Review | Default-time search skips non-five-minute values | **Resolved.** Searches each minute compatible with configured stepping and returns null when no valid minute exists. Format tests cover a 10:17-only window and no-valid-time days; component user-event tests verify failed date selection preserves the previous value. Search precision remains minutes, matching the selectable controls. |
| Low | Documentation/build maintenance debt | **Resolved.** README/API/migration docs and the unified npm-CDN demo are committed in `64100ef`. Sass modules, Vite, tests, coverage, and CI are in place. Removed unrelated `data-ui-set-color` markup and the legacy demo pages. |

### Section 8 fixes and additional regression checks

- **Stale selection after a refresh callback:** reproduced an input changing to September 17 while the calendar still marked September 16 selected. A selection change during a refresh now triggers one final redraw without re-emitting refresh events. Regression cases cover single-date, multi-date, and time values and assert exactly one callback invocation.
- **Time-grid validation disagrees with selection:** reproduced an hour disabled for a valid 10:17 selection and minute choices disabled when the current seconds were 30. Hour choices now preserve minutes/seconds/milliseconds while validating; minute choices preserve seconds/milliseconds. This matches their selection handlers. Regression cases also verify an hour whose preserved minutes violate a callback remains disabled.
- **Constructor exceptions:** added validation/render callback failure cases. They verify error propagation, registration/DOM cleanup, restored input visibility/attributes, and successful reinitialization.
- **Minute rollover at bounds:** added a midnight-rounding case with inclusive bounds, rejection after the upper bound is narrowed, and rejection below the lower bound after rounding.
- Existing regressions already verify invalid DateTime validity is preserved, modal change events report the committed old/new values once, and native input synchronization does not duplicate change events.

### Remaining issues and release follow-ups

| Item | Status and handling |
| --- | --- |
| UI 4 focus trap at the browser boundary | **Upstream limitation.** Forward Tab can reach browser chrome when there is no following page control. Recorded in README and the implementation notes; nested-modal restoration and redirection among page controls are covered. No sibling UI source changes are included. |
| UI 4 declarative modal toggle/backdrop interaction | **Upstream limitation.** Under reduced motion, the opening click can also dismiss a default-backdrop modal. The demo follows SelectMenu's static-backdrop pattern with an explicit Close editor button. Picker-created modals already stop propagation of their opening input click. |
| Deprecated development dependencies | **Maintenance follow-up.** `clean-css-cli → glob@7 → inflight` remains aligned with the reference minifier. No dependency override is introduced. |
| Node 20/22 CI and remote services | **Release verification pending.** Local runs use Node 24. The CI matrix, Codecov activation/upload, and npm trusted-publishing configuration must be verified remotely before release; nothing has been published by this work. |

## 9. Implementation sequence and acceptance

Implement the main sections in their numbered order:

- **Sections 1–2:** dependency/package configuration and Vite distribution.
- **Section 3:** JavaScript migration, behavior, and integration fixes.
- **Section 4:** Sass, UI tokens, and component layout.
- **Section 5:** Playwright behavioral suites and source-mapped Codecov reporting.
- **Section 6:** CI and publishing configuration.
- **Section 7:** README and demos.
- **Section 8:** audit the findings, close remaining picker defects and regression gaps, then perform final release validation against the criteria below.

The migration is complete when:

- A clean install builds all ESM/UMD/CSS variants and source maps, with correct exports and external peers; no legacy Rollup/Terser pipeline or prototype/static composition remains.
- `npx sort-package-json`, lint, build, Sass-unused audit, browser tests in the stated matrix, and Chromium coverage have been run successfully. Coverage maps to authored picker source and satisfies the configured project policy.
- Confirmed bugs have regression tests; any unresolved investigation is documented honestly with its impact.
- Package consumption works independently of sibling checkouts; `npm pack --dry-run` contains the intended files, and rebuilding leaves tracked `dist` clean.
- README examples and demos work against the declared dependency majors and cover the component's actual supported behavior.
- CI and release workflows use the correct repository/package identity; Codecov and npm trusted publishing are configured before the release is published.

Expected breaking changes are the dependency majors and supported toolchain, built ESM package entry/exports, removal of underscore internals/prototype composition, CSS variable/Sass import changes, and any explicitly documented correction to invalid-input behavior. Preserve existing public picker method names, registration key, event namespace, class customization, and selection modes wherever they remain compatible with UI 4.
