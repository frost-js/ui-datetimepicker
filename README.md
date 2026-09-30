# Frost UI DateTimePicker

[![CI](https://github.com/elusivecodes/FrostUI-DateTimePicker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/elusivecodes/FrostUI-DateTimePicker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/elusivecodes/FrostUI-DateTimePicker/branch/main/graph/badge.svg)](https://codecov.io/gh/elusivecodes/FrostUI-DateTimePicker)
[![npm version](https://img.shields.io/npm/v/%40fr0st%2Fui-datetimepicker?style=flat-square)](https://www.npmjs.com/package/@fr0st/ui-datetimepicker)
[![npm downloads](https://img.shields.io/npm/dm/%40fr0st%2Fui-datetimepicker?style=flat-square)](https://www.npmjs.com/package/@fr0st/ui-datetimepicker)
[![CSS gzip size](https://img.badgesize.io/elusivecodes/FrostUI-DateTimePicker/main/dist/frost-ui-datetimepicker.min.css?compression=gzip&label=CSS%20gzip%20size&style=flat-square)](./dist/frost-ui-datetimepicker.min.css)
[![JS gzip size](https://img.badgesize.io/elusivecodes/FrostUI-DateTimePicker/main/dist/frost-ui-datetimepicker.min.js?compression=gzip&label=JS%20gzip%20size&style=flat-square)](./dist/frost-ui-datetimepicker.min.js)
[![license](https://img.shields.io/github/license/elusivecodes/FrostUI-DateTimePicker?style=flat-square)](./LICENSE)

Locale-aware date and time selection for Frost UI, with popup calendars, inline layouts, modal drafts, and multiple dates.

## Highlights

- Date, month, year, time, and combined date/time pickers
- Locale-based formats and week starts, explicit 12/24-hour clocks, and time zones
- Multiple dates with sorting, deduplication, and a configurable separator
- Inclusive bounds, validation callbacks, minute stepping, and custom calendar cells
- Popup, inline, side-by-side, and modal layouts with Set/Cancel
- Keyboard navigation, accessible states, and native form reset synchronization
- Frost UI v4 theme tokens, RTL styles, and configurable Sass variables
- Native `DateTimePicker` class and `datetimepicker` fQuery plugin
- ESM/UMD bundles, minified CSS/JS, source maps, and JSDoc IntelliSense

Try the [demo](./demo/index.html). Serve the repository over HTTP to use it locally.

## Installation

### Browser projects / bundlers

Install the picker with Frost UI 4, fQuery 5, and Frost DateTime 8.1.3 or newer within major 8:

```bash
npm i @fr0st/ui-datetimepicker@4 @fr0st/ui@4 @fr0st/query@5 @fr0st/datetime@^8.1.3
```

```js
import '@fr0st/ui/dist/frost-ui.min.css';
import '@fr0st/ui-datetimepicker/dist/frost-ui-datetimepicker.min.css';
import DateTimePicker from '@fr0st/ui-datetimepicker';

const picker = DateTimePicker.init(document.querySelector('#appointment'), {
    format: 'yyyy-MM-dd HH:mm',
    locale: 'en-GB',
});
```

The package root resolves to compiled ESM. Peers remain external so the component shares the application's UI, fQuery, and DateTime instances. Package exports also expose `dist/*` and `src/*`. A browser DOM is required; load the component on the client in server-rendered applications.

### Browser (ESM)

Map every bare import, including UI/fQuery's transitive `@fr0st/core` dependency. Load UI CSS before picker CSS.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fr0st/ui@4/dist/frost-ui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@4/dist/frost-ui-datetimepicker.min.css">

<label for="appointment">Appointment</label>
<input id="appointment" class="input-outline" type="text" autocomplete="off">

<script type="importmap">
{
    "imports": {
        "@fr0st/core": "https://cdn.jsdelivr.net/npm/@fr0st/core@4/dist/frost-core.esm.min.js",
        "@fr0st/query": "https://cdn.jsdelivr.net/npm/@fr0st/query@5/dist/fquery.esm.min.js",
        "@fr0st/ui": "https://cdn.jsdelivr.net/npm/@fr0st/ui@4/dist/frost-ui.esm.min.js",
        "@fr0st/datetime": "https://cdn.jsdelivr.net/npm/@fr0st/datetime@8/dist/frost-datetime.esm.min.js"
    }
}
</script>
<script type="module">
    import DateTimePicker from 'https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@4/dist/frost-ui-datetimepicker.esm.min.js';
    DateTimePicker.init(document.querySelector('#appointment'), { format: 'yyyy-MM-dd HH:mm' });
</script>
```

### Browser (UMD)

Load the UI bundle, DateTime, and picker in that order:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fr0st/ui@4/dist/frost-ui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@4/dist/frost-ui-datetimepicker.min.css">

<label for="appointment">Appointment</label>
<input id="appointment" class="input-filled" type="text" autocomplete="off">

<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui@4/dist/frost-ui-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fr0st/datetime@8/dist/frost-datetime.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@4/dist/frost-ui-datetimepicker.min.js"></script>
<script>
    UI.DateTimePicker.init(document.querySelector('#appointment'), { format: 'yyyy-MM-dd HH:mm' });
</script>
```

The picker adds `DateTimePicker` to `globalThis.UI`. UI's bundle supplies `UI` and `fQuery`; do not load a second fQuery copy. With UI's non-bundled build, load core, fQuery, UI, DateTime, then the picker.

### Custom Sass builds

```scss
@use '@fr0st/ui-datetimepicker/src/scss/datetimepicker' with (
    $datetimepicker-width: 320px,
    $datetimepicker-wide-width: 640px
);
```

```bash
npm i -D sass
npx sass --load-path=node_modules src/styles.scss dist/styles.css
```

The module forwards the [Sass variables](./src/scss/_vars.scss), all declared with `!default`. Include UI CSS separately. Build tools that resolve npm Sass modules do not need the explicit load path.

## Usage

Use a labeled text input. The picker preserves its classes, name, and native value:

```html
<label for="appointment">Appointment</label>
<input id="appointment" name="appointment" class="input-outline" type="text"
    value="2026-09-15 09:30" autocomplete="off" aria-describedby="appointment-help">
<p id="appointment-help" class="form-text">Use YYYY-MM-DD HH:mm, or choose a date and time.</p>
```

```js
import DateTimePicker from '@fr0st/ui-datetimepicker';

const picker = DateTimePicker.init(document.querySelector('#appointment'), {
    format: 'yyyy-MM-dd HH:mm',
    locale: 'en-GB',
    timeZone: 'Australia/Brisbane',
    minuteStepping: 5,
});

picker.setDate([2026, 9, 16, 10, 30]);
const selected = picker.getDate(); // DateTime, or null when empty.
picker.clear();
```

Calling `init()` again returns the existing instance. Options are frozen; dispose and reinitialize to change configuration or the input's associated form. `defaultDate` sets an empty picker's starting view; `useCurrent` selects the current time for an empty single-date input.

### Formats and date inputs

| Format | Controls |
| --- | --- |
| `yyyy-MM-dd` | Calendar date |
| `yyyy-MM` | Month and year |
| `yyyy` | Year |
| `HH:mm` | 24-hour time |
| `hh:mm a` | 12-hour time with period toggle |
| `yyyy-MM-dd HH:mm` | Date and time |

With `format: null`, single-date mode derives a date/time format from the locale; multi-date mode derives a date-only format. Explicit hour tokens override the locale's default hour cycle. Days require a month and year; minutes require hours; combined date/time requires a complete calendar date. Time controls cannot be combined with `multiDate`.

Patterns use [Frost DateTime tokens](https://github.com/frost-js/datetime/blob/main/Formats.md). Quote literal letters, for example `yyyy-MM-dd 'at' HH:mm`. Controls cover years, months, days, hours, and minutes; there are no second or millisecond controls.

`setDate()`, bounds, and `defaultDate` accept:

| Input | Meaning |
| --- | --- |
| String | Parse with `format`, then each `altFormats` pattern. |
| Number | UNIX **seconds**; `0` is valid. Convert `Date.now()` milliseconds with `/ 1000`, or pass a `Date`. |
| Array tuple | `[year, month, day, hours, minutes, seconds, milliseconds]`; month/day are 1-based. |
| Native `Date` | An instant converted to the configured time zone. |
| `DateTime` | An immutable date converted to the configured locale and time zone. |
| `null` | Clear a selection or remove a bound. |

In multi-date mode, pass an array of date inputs or null: `[[2026, 9, 15], [2026, 9, 16]]` selects two tuples. Values are sorted and deduplicated by the visible day, month, or year. `getDate()` returns a copied array. A scalar multi-date argument throws a `TypeError`.

Strings do not fall back to general ISO parsing. Add an appropriate `altFormats` pattern or convert to a Date/DateTime first. Invalid programmatic values clear a single-date selection; invalid entries are filtered from multi-date values. Invalid bounds parse as null and remove the bound.

Locale and time zone use DateTime's defaults at initialization when omitted. Locale controls labels and week starts; the time zone controls interpretation and display. Time-only strings such as `09:30` use DateTime's January 1, 1970 anchor, while Date/DateTime inputs preserve their actual date. Use consistent anchors for time-only bounds, or `isValidTime` for recurring time-of-day rules. Nonexistent DST wall times are rejected; ambiguous times follow DateTime's parsing rules.

### Layouts, multiple dates, and callbacks

```js
DateTimePicker.init(document.querySelector('#days'), {
    format: 'yyyy-MM-dd',
    multiDate: true,
    multiDateSeparator: '; ',
}).setDate(['2026-09-15', '2026-09-18']);

DateTimePicker.init(document.querySelector('#calendar'), {
    format: 'yyyy-MM-dd HH:mm',
    inline: true,
    sideBySide: true,
    showToolbar: true,
});

DateTimePicker.init(document.querySelector('#confirmed-date'), {
    format: 'yyyy-MM-dd',
    modal: true,
});
```

Inline mode hides the input and renders in place. Side-by-side panels stack below 992px; `vertical: true` keeps them stacked at every width. In a modal, selection is a draft until Set. Cancel, Escape, and backdrop dismissal discard it; the input and `getDate()` retain the committed value until Set. Programmatic setters still commit immediately.

```js
DateTimePicker.init(document.querySelector('#workday'), {
    format: 'yyyy-MM-dd HH:mm',
    minDate: [2026, 9, 1],
    maxDate: [2026, 9, 30, 23, 59],
    isValidDay: (date) => date.getWeekDay() >= 1 && date.getWeekDay() <= 5,
    isValidTime: (date) => date.getHours() >= 9 && date.getHours() < 17,
    renderDay: (date, node) => {
        if (date.getDate() === 15) {
            node.title = 'Team planning day';
            node.classList.add('fw-bold');
        }
    },
});
```

Validation callbacks receive a `DateTime` and return a boolean. Keep them synchronous and inexpensive: they run during rendering and time searches. Year/month/day validation is hierarchical; time validation runs for time choices. Bounds are inclusive, using calendar granularity for rendered cells and instant precision for committed values. Normalize date-only bounds to the intended day boundaries.

Rendering callbacks receive `(date, node)` and return nothing. Preserve generated roles, accessible names, focus attributes, and selection data. Use text/DOM APIs for user-provided content.

## Options

Explicit options override `data-ui-*` attributes, which override `DateTimePicker.defaults`.

| Option | Default | Description |
| --- | --- | --- |
| `format` | `null` | DateTime pattern; derive from locale when null. |
| `altFormats` | `[]` | Additional accepted patterns; output uses `format`. |
| `ariaFormat` | `'LLLL d, yyyy'` | Accessible day-cell label pattern. |
| `locale` | `null` | Locale; null uses DateTime's current default. |
| `timeZone` | `null` | IANA/fixed-offset zone; null uses DateTime's default. |
| `defaultDate` | `null` | Starting view when empty; null uses now. |
| `defaultView` | `null` | `'days'`, `'months'`, or `'years'`; defaults to the smallest supported view. |
| `minDate` | `null` | Inclusive lower bound, using a date input. |
| `maxDate` | `null` | Inclusive upper bound, using a date input. |
| `isValidYear` | `null` | `(date) => boolean` year validator. |
| `isValidMonth` | `null` | `(date) => boolean` month validator. |
| `isValidDay` | `null` | `(date) => boolean` day validator. |
| `isValidTime` | `null` | `(date) => boolean` time validator. |
| `renderYear` | `null` | `(date, node) => void` year-cell customization. |
| `renderMonth` | `null` | `(date, node) => void` month-cell customization. |
| `renderDay` | `null` | `(date, node) => void` day-cell customization. |
| `multiDate` | `false` | Multiple date/month/year values; excludes time controls. |
| `multiDateSeparator` | `','` | Input/output separator for multiple dates. |
| `minuteStepping` | `1` | Integer 1–60. Round to the nearest interval, including hour rollover; invalid steps throw. Step 1 uses five-minute grid shortcuts and one-minute arrow adjustments. |
| `useCurrent` | `false` | Select now when a single-date input starts empty. |
| `keepOpen` | `false` | Keep a date-only popup open after selection. |
| `inline` | `false` | Render in place and hide the input; takes precedence over modal settings. |
| `sideBySide` | `false` | Display date/time panels together. |
| `vertical` | `false` | Keep side-by-side panels stacked. |
| `showToolbar` | `false` | Display the selected date/time above the controls. |
| `showClose` | `false` | Show Close in a non-inline, nonmodal popup. |
| `keepInvalid` | `false` | Keep invalid typed text on change; otherwise restore the last valid value. Entirely invalid text has no selection when true. This is not native validity enforcement. |
| `ignoreReadonly` | `false` | Allow picker selection on readonly inputs; disabled inputs remain disabled. |
| `modal` | `false` | Use a UI modal with Set/Cancel. |
| `mobileModal` | `true` | Use a modal for supported mobile user agents, independently of viewport width. |
| `duration` | `100` | Popup/panel animation milliseconds; respects reduced motion. Modal transitions use UI styling. |
| `appendTo` | `null` | Selector/element for popup or modal attachment; otherwise insert beside the input or its containing modal. |
| `placement` | `'bottom'` | UI Popper placement: `'top'`, `'bottom'`, `'start'`, `'end'`, or `'auto'`; logical sides follow RTL. |
| `position` | `'start'` | Alignment along the popup edge: `'start'`, `'center'`, or `'end'`. |
| `fixed` | `false` | Preserve the preferred placement; this is not CSS fixed positioning. |
| `spacing` | `0` | Popup distance from the input in pixels. |
| `minContact` | `false` | Minimum overlap while repositioning: pixel number, false for zero, or null for UI's automatic value. |

## Data attributes

Serializable options use kebab-case `data-ui-*` attributes. Arrays accept JSON. Supply callbacks and DOM elements through JavaScript.

```html
<label for="days">Available days</label>
<input id="days" class="input-outline" type="text"
    data-ui-toggle="datetimepicker"
    data-ui-format="yyyy-MM-dd"
    data-ui-alt-formats='["dd/MM/yyyy"]'
    data-ui-multi-date="true"
    data-ui-mobile-modal="false">
<script>
    $('[data-ui-toggle="datetimepicker"]').datetimepicker();
</script>
```

`data-ui-toggle="datetimepicker"` is an initialization selector; it does **not** initialize the component by itself.

## Methods

| Method | Returns | Behavior |
| --- | --- | --- |
| `DateTimePicker.init(input, options?)` | `DateTimePicker` | Create or retrieve an instance for an input element. |
| `dispose()` | `void` | Remove owned events, calendars, modal resources, and registration; restore owned input styles/attributes. Safe to call twice. |
| `clear()` | `void` | Clear the selection and input value. |
| `disable()` / `enable()` | `void` | Change the native disabled attribute and picker state. Disabled ancestor fieldsets still apply. |
| `getDate()` | `DateTime`, `null`, or `DateTime[]` | Committed selection; returns a copied array for multi-date mode. |
| `getMinDate()` / `getMaxDate()` | `DateTime` or `null` | Current parsed bounds. |
| `getViewDate()` | `DateTime` | Current calendar navigation date. |
| `setDate(value)` | `void` | Parse, validate, normalize, and commit a selection. |
| `setMinDate(value)` / `setMaxDate(value)` | `void` | Change/remove a bound and revalidate. |
| `refresh()` | `void` | Revalidate stored selections and redraw, including changed disabled/readonly state. |
| `show()` / `hide()` / `toggle()` | `void` | Control popup/modal visibility; inline pickers remain visible. |
| `update()` | `void` | Reposition an open popup. |

Mutators do not return the instance for chaining. `setDate()` and `clear()` do not edit disabled inputs, or readonly inputs unless `ignoreReadonly` applies. Bound setters still update bounds. `refresh()` revalidates stored dates; dispatch native input/change events to synchronize an externally changed input value.

The instance exposes `node` and frozen `options` getters, both null after disposal. Initialize a new instance before further use. Returned DateTime values are immutable: `date.withHours(10)` returns a new value to pass to `setDate()`.

### Static customization

Set `DateTimePicker.defaults`, `DateTimePicker.classes`, `DateTimePicker.icons`, and `DateTimePicker.lang` before initialization. Their keys are listed in the [class source](./src/js/date-time-picker.js). Preserve structural classes and accessible labels. Locale formats calendar text; translate `lang` separately for controls such as Set, Cancel, and Next Month.

```js
DateTimePicker.defaults.locale = 'en-GB';
DateTimePicker.lang.set = 'Apply';

DateTimePicker.getDefaultDateFormat('en-GB'); // dd/MM/yyyy
DateTimePicker.getDefaultTimeFormat('en-US', false); // HH:mm
DateTimePicker.getDefaultFormat('en-US', true); // Date and 12-hour time.
```

All three helpers return strings. The optional boolean on time/combined helpers selects a 12-hour clock; omitted, it follows the locale.

## Events

Events fire on the original input. Use fQuery for namespaced listeners:

| Event | Detail | Behavior |
| --- | --- | --- |
| `show.ui.datetimepicker` | None | Before opening; cancelable. |
| `shown.ui.datetimepicker` | None | After opening completes. |
| `hide.ui.datetimepicker` | None | Before closing; cancelable. |
| `hidden.ui.datetimepicker` | None | After closing completes. |
| `change.ui.datetimepicker` | `{ old, new }` | A changed formatted value is committed; each value is DateTime/null or an array. |
| `refresh.ui.datetimepicker` | `{ view, viewMode, viewDate }` | Panel redraw. `view` is `'date'`/`'time'`; modes are `'days'`, `'months'`, `'years'`, `'hours'`, `'minutes'`, or null for main time controls. |

```js
import $ from '@fr0st/query';

$.addEvent('#appointment', 'change.ui.datetimepicker', (event) => {
    // Native user changes have no picker-specific detail.
    if (event.detail && 'new' in event.detail) {
        console.log(event.detail.old, event.detail.new);
    }
});

$.addEvent('#appointment', 'hide.ui.datetimepicker', (event) => {
    if (document.querySelector('#lock-picker')?.checked) {
        event.preventDefault();
    }
});
```

Returning false from an fQuery show/hide handler also cancels it. Programmatic setters and clear emit change when the formatted value changes; identical values do not. Native input/change synchronization does not emit an extra change. Native change events have no `{ old, new }`; read `getDate()` or the input instead. Modal draft edits redraw without committing a change event. A canceled hide retains the draft. Form reset synchronization is silent.

## fQuery API

```js
import $ from '@fr0st/query';
import '@fr0st/ui-datetimepicker';

const picker = $('#appointment').datetimepicker({ format: 'yyyy-MM-dd' });
$('#appointment').datetimepicker('setDate', [2026, 9, 15]);
const date = $('#appointment').datetimepicker('getDate');
$('#appointment').datetimepicker('clear');
```

Initialization and method calls apply to every matched element and return the first element's result: an instance, getter value, or undefined for mutators. The registration key is `datetimepicker`; in UMD, `$.getData(input, UI.DateTimePicker.DATA_KEY)` retrieves an existing instance without creating one.

## Accessibility

Provide a visible label and format instructions, optionally linked with `aria-describedby`. Popups are named nonmodal dialogs; UI modals use modal semantics. Inputs expose expanded state and controlled-dialog relationships. Calendar choices use button roles, `aria-pressed`, and `aria-disabled`.

| Focus | Keys |
| --- | --- |
| Input | Focus/click opens a popup; click or Enter opens a modal. Enter toggles; Escape closes. |
| Calendar day | Arrows move by day/week; Home/End move to week endpoints; PageUp/PageDown move a month. Ctrl+Left/Right move a month; Ctrl+Up/Down move a year. |
| Month/year choices | Left/Right move one choice; Up/Down move three. |
| Time controls | Up/Down adjust the unit or toggle AM/PM. |
| Hour/minute grid | Arrows move among enabled choices; Enter/Space selects. |
| Action control | Enter/Space activates. |

Tab/Shift+Tab move among input/calendar controls. Escape and completed popup selection restore input focus. UI handles modal focus restoration, nested modals, and focus redirection from outside page controls. Its shared focus trap can allow Tab to reach browser chrome when a modal is the document's last focusable content; see the [known issues](./MIGRATION_PROPOSAL.md).

Inline mode hides the native input from focus and the accessibility tree. Give the visible calendar a nearby heading and descriptive text. Reduced motion disables picker animations. Custom rendering must preserve generated accessibility and focus attributes.

## Forms

The named native input submits the formatted string, including the multi-date separator. Reset restores its `defaultValue`, stored selection, and calendar view without emitting a picker change. Canceled resets do nothing; disposal cancels pending reset work.

Native `required` checks an empty text input; it does not validate date syntax, bounds, or callback rules. `keepInvalid` can preserve nonempty invalid text. Apply application/server validation as needed. Inline inputs are hidden, so browser invalid-focus behavior is unsuitable for inline required controls; use a visible popup input for native required validation.

Disabled fieldsets apply and exclude the input from submission. Call `refresh()` after externally changing disabled/readonly state while an inline calendar is visible. For an external value change, dispatch the corresponding event:

```js
const input = document.querySelector('#appointment');
input.value = '2026-09-16 10:30';
input.dispatchEvent(new Event('change', { bubbles: true }));
```

## Themes and RTL

Load UI CSS first. Set `data-ui-theme="light"`/`"dark"` on the document root, or omit it to follow the system. Set `dir="rtl"` on the document or a containing region for RTL alignment and the mirrored today marker. Use logical Popper placements (`start`/`end`) for horizontal attachment.

Component CSS variables are `--ui-datetimepicker-z-index`, `--ui-datetimepicker-bg`, `--ui-datetimepicker-border-width`, and `--ui-datetimepicker-border-color`. Override them on the rendered `.datetimepicker`, not only the input:

```css
.datetimepicker {
    --ui-datetimepicker-border-color: var(--ui-primary);
}
```

Use Sass for widths, today-marker dimensions, and action styling. Inline/modal variants override their own background/border defaults.

## Migrating from 3.x

- Upgrade peers to UI 4, fQuery 5, and DateTime 8.1.3+. The package root is built ESM; UMD files remain under `dist/` and extend `UI`.
- Replace source `wrapper.js` references with `browser.js`. Prototype composition and underscore internals are removed; use public methods and `node`/`options` getters.
- Options are frozen. Use bound setters or dispose/reinitialize instead of mutating options.
- DateTime's immutable `with*` methods replace removed `set*` methods. Numeric picker inputs remain UNIX seconds, including zero.
- After clearing a multi-date selection, `getDate()` returns an empty array; setters reject scalars and deduplicate at day/month/year precision.
- Invalid stepping throws; accepted values are integers 1–60. Invalid Date/DateTime values no longer become valid dates through copying.
- Strings require `format`/`altFormats`. Explicit hour tokens now determine the 12/24-hour controls.
- Replace `--datetimepicker-*` with `--ui-datetimepicker-*`. Replace Sass `@import` with `@use ... with (...)`; `_vars.scss` is forwarded by `datetimepicker.scss`.
- Demos are consolidated into `demo/index.html`; the separate light/dark and methods/events pages have been removed.

## Development

Use Node `^20.19.0`, `^22.13.0`, or `>=24`, matching Frost UI's toolchain.

```bash
npm ci
npx playwright install --with-deps
npm run lint
npm run lint:sass:unused
npm run test                 # Build, then Chromium/Firefox/WebKit.
npm run test:coverage        # Chromium; uses the existing build.
npm pack --dry-run
```

`npm run build` generates ESM/UMD JS, expanded/minified CSS, and maps. Commit generated `dist/` files with source changes. `test:browser`, `test:headed`, and `test:ui` use existing builds. `PORT` overrides the test server's default 3001. Coverage writes HTML and LCOV to `coverage/`; generated reports are ignored by Git.

Serve the repository with any static HTTP server and open `/demo/`. For example, with Python installed:

```bash
python3 -m http.server 8080
```

The demo uses npm CDN URLs for UI 4/DateTime 8 and local picker bundles. Its theme selector persists a preference when browser storage is available. CI covers Chromium on Node 20/22/24 and Firefox/WebKit on Node 24. The release workflow validates and publishes with provenance; configure npm trusted publishing and Codecov activation before release.

## License

MIT. See [LICENSE](./LICENSE).
