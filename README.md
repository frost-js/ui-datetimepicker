# Frost UI DateTimePicker

[![CI](https://github.com/frost-js/ui-datetimepicker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/frost-js/ui-datetimepicker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/frost-js/ui-datetimepicker/branch/main/graph/badge.svg)](https://codecov.io/gh/frost-js/ui-datetimepicker)
[![npm version](https://img.shields.io/npm/v/%40fr0st%2Fui-datetimepicker?style=flat-square)](https://www.npmjs.com/package/@fr0st/ui-datetimepicker)
[![npm downloads](https://img.shields.io/npm/dm/%40fr0st%2Fui-datetimepicker?style=flat-square)](https://www.npmjs.com/package/@fr0st/ui-datetimepicker)
[![JS gzip size](https://img.badgesize.io/frost-js/ui-datetimepicker/main/dist/frost-ui-datetimepicker.min.js?compression=gzip&label=JS%20gzip%20size&style=flat-square)](https://github.com/frost-js/ui-datetimepicker/blob/main/dist/frost-ui-datetimepicker.min.js)
[![CSS gzip size](https://img.badgesize.io/frost-js/ui-datetimepicker/main/dist/frost-ui-datetimepicker.min.css?compression=gzip&label=CSS%20gzip%20size&style=flat-square)](https://github.com/frost-js/ui-datetimepicker/blob/main/dist/frost-ui-datetimepicker.min.css)
[![license](https://img.shields.io/github/license/frost-js/ui-datetimepicker?style=flat-square)](./LICENSE)

Locale-aware date and time selection for Frost UI, with popup calendars, inline layouts, modal drafts, and multiple dates.

## Highlights

- Date, month, year, time, and combined date/time pickers
- Locale-based formats and week starts, explicit 12/24-hour clocks, and time zones
- Multiple dates with sorting, deduplication, and a configurable separator
- Inclusive date ranges with two selections in one calendar
- Inclusive bounds, validation callbacks, minute stepping, and custom calendar cells
- Popup, inline, side-by-side, and modal layouts with Set/Cancel
- Keyboard navigation, accessible states, and native form reset synchronization
- Frost UI v4 theme tokens, RTL styles, and configurable Sass variables
- Native `DateTimePicker` class and `datetimepicker` fQuery plugin
- Existing-instance reuse with frozen resolved options
- Prebuilt ESM and UMD bundles with source maps
- Expanded and minified component CSS with source maps
- JSDoc-powered IntelliSense

Explore [the demo](./demo/index.html) for interactive examples.

## Installation

### Browser projects / bundlers

```bash
npm i @fr0st/ui-datetimepicker
```

Frost UI DateTimePicker's package entry point is ESM-only and requires a browser DOM. Import the default `DateTimePicker` export and the stylesheets in browser projects and bundlers.

```js
import '@fr0st/ui/dist/frost-ui.min.css';
import '@fr0st/ui-datetimepicker/dist/frost-ui-datetimepicker.min.css';
import DateTimePicker from '@fr0st/ui-datetimepicker';
```

`@fr0st/ui`, `@fr0st/query`, and `@fr0st/datetime` are peer dependencies so the component shares the application's instances.

### Browser (ESM)

The ESM bundle imports `@fr0st/ui`, `@fr0st/query`, and `@fr0st/datetime`. fQuery also imports `@fr0st/core`, so map all four dependencies when loading the bundle directly in a browser:

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.min.css">
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@latest/dist/frost-ui-datetimepicker.min.css">
<script type="importmap">
{
    "imports": {
        "@fr0st/core": "https://cdn.jsdelivr.net/npm/@fr0st/core@latest/dist/frost-core.esm.min.js",
        "@fr0st/query": "https://cdn.jsdelivr.net/npm/@fr0st/query@latest/dist/fquery.esm.min.js",
        "@fr0st/ui": "https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.esm.min.js",
        "@fr0st/datetime": "https://cdn.jsdelivr.net/npm/@fr0st/datetime@latest/dist/frost-datetime.esm.min.js"
    }
}
</script>
<script type="module">
    import DateTimePicker from 'https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@latest/dist/frost-ui-datetimepicker.esm.min.js';
</script>
```

### Browser (UMD)

Load the bundles from your own copy or a CDN:

```html
<link
    rel="stylesheet"
    href="/path/to/dist/frost-ui.min.css">
<link
    rel="stylesheet"
    href="/path/to/dist/frost-ui-datetimepicker.min.css">
<script src="/path/to/dist/frost-ui-bundle.min.js"></script>
<script src="/path/to/dist/frost-datetime.min.js"></script>
<script src="/path/to/dist/frost-ui-datetimepicker.min.js"></script>
<!-- or -->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui.min.css">
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@latest/dist/frost-ui-datetimepicker.min.css">
<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui@latest/dist/frost-ui-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fr0st/datetime@latest/dist/frost-datetime.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fr0st/ui-datetimepicker@latest/dist/frost-ui-datetimepicker.min.js"></script>
<script>
    const { DateTimePicker } = globalThis.UI;
</script>
```

The UMD bundle adds `DateTimePicker` to the existing `globalThis.UI` object. Load Frost UI's all-in-one bundle first; it supplies the `UI` and `fQuery` globals. Load Frost DateTime before DateTimePicker as shown above.

The package root resolves to the prebuilt ESM bundle. Published files under `dist/` and `src/` are also available through matching package subpaths.

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

Dispose and reinitialize after changing the input's form association. `defaultDate` sets an empty picker's starting view; `useCurrent` selects the current time for an empty single-date input.

### Formats and date inputs

| Format | Controls |
| --- | --- |
| `yyyy-MM-dd` | Calendar date |
| `yyyy-MM` | Month and year |
| `yyyy` | Year |
| `HH:mm` | 24-hour time |
| `hh:mm a` | 12-hour time with period toggle |
| `yyyy-MM-dd HH:mm` | Date and time |

With `format: null`, single-date mode derives a date/time format from the locale; multi-date and range modes derive a date-only format. Explicit hour tokens override the locale's default hour cycle. Days require a month and year; minutes require hours; combined date/time requires a complete calendar date. Time controls cannot be combined with `multiDate` or `range`.

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

### Date ranges

Enable `range` to select two inclusive endpoints in one calendar:

```js
const picker = DateTimePicker.init(document.querySelector('#stay'), {
    range: true,
    format: 'yyyy-MM-dd',
});

picker.setDate(['2026-11-01', '2026-11-05']);
const [start, end] = picker.getDate();
// Input: 2026-11-01 – 2026-11-05
```

The first selection starts a draft; hovering another selectable day previews the range, and the second selection commits the pair. Reversed endpoints are sorted, and selecting the same day twice creates a one-day range. Selecting again starts a replacement. The input and `getDate()` retain the committed value until the pair is complete. Popup dismissal discards an incomplete draft; Escape also cancels an inline draft. In a modal, Set commits the completed pair and is disabled while an endpoint is pending.

`getDate()` returns a copied `[DateTime, DateTime]` pair or `null`. `setDate()` accepts exactly two date inputs, or `null`/`undefined` to clear. Nest tuple endpoints: `[[2026, 11, 1], [2026, 11, 5]]`. A scalar or an array of another length throws `TypeError`; an invalid endpoint clears the whole range. Endpoints normalize to the start of their day in the configured time zone.

Ranges require a complete date-only format and cannot be combined with `multiDate`. `useCurrent` does not create a range; `defaultDate` controls the initial view. Month/year panels remain available for navigation.

`rangeSeparator` defaults to `' – '` and must be a nonempty string that does not occur in a formatted endpoint. Typed input must contain two dates separated by that exact string; each date accepts `format` or `altFormats`. Invalid text follows `keepInvalid`: restore the previous value when false, or retain the text and clear the internal range on normalization when true.

Bounds and validation callbacks apply to both endpoints at day precision. Disabled interior days may be crossed: a Friday-to-Monday range can include a disabled weekend. `refresh()` and bound setters discard range drafts and revalidate the committed pair, clearing it if either endpoint is invalid. Programmatic `setDate()` and `clear()` commit immediately, including while a modal is open.

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

Options are resolved in this order:

1. Component defaults
2. The element's `data-ui-*` attributes
3. Options passed to `DateTimePicker.init()`

Resolved `instance.options` are shallow-frozen.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `altFormats` | `string[]` | `[]` | Additional accepted patterns; output uses `format`. |
| `appendTo` | `string \| HTMLElement \| null` | `null` | Selector/element for popup or modal attachment; otherwise insert beside the input or its containing modal. |
| `ariaFormat` | `string \| null` | `'LLLL d, yyyy'` | Accessible day-cell label pattern. |
| `defaultDate` | `DateInput` | `null` | Starting view when empty; null uses now. |
| `defaultView` | `'days' \| 'months' \| 'years' \| null` | `null` | `'days'`, `'months'`, or `'years'`; defaults to the smallest supported view. |
| `duration` | `number` | `100` | CSS transition duration in milliseconds for popup opacity and panel height; respects reduced motion. Modal transitions use UI styling. |
| `fixed` | `boolean` | `false` | Preserve the preferred placement; this is not CSS fixed positioning. |
| `format` | `string \| null` | `null` | DateTime pattern; derive from locale when null. |
| `ignoreReadonly` | `boolean` | `false` | Allow picker selection on readonly inputs; disabled inputs remain disabled. |
| `inline` | `boolean` | `false` | Render in place and hide the input; takes precedence over modal settings. |
| `isValidDay` | `((date: DateTime) => boolean) \| null` | `null` | `(date) => boolean` day validator. |
| `isValidMonth` | `((date: DateTime) => boolean) \| null` | `null` | `(date) => boolean` month validator. |
| `isValidTime` | `((date: DateTime) => boolean) \| null` | `null` | `(date) => boolean` time validator. |
| `isValidYear` | `((date: DateTime) => boolean) \| null` | `null` | `(date) => boolean` year validator. |
| `keepInvalid` | `boolean` | `false` | Keep invalid typed text on change; otherwise restore the last valid value. Entirely invalid text has no selection when true. This is not native validity enforcement. |
| `keepOpen` | `boolean` | `false` | Keep a date-only popup open after selection. |
| `locale` | `string \| null` | `null` | Locale; null uses DateTime's current default. |
| `maxDate` | `DateInput` | `null` | Inclusive upper bound, using a date input. |
| `minContact` | `number \| false \| null` | `false` | Minimum overlap while repositioning: pixel number, false for zero, or null for UI's automatic value. |
| `minDate` | `DateInput` | `null` | Inclusive lower bound, using a date input. |
| `minuteStepping` | `number` | `1` | Integer 1–60. Round to the nearest interval, including hour rollover; invalid steps throw. Step 1 uses five-minute grid shortcuts and one-minute arrow adjustments. |
| `mobileModal` | `boolean` | `true` | Use a modal for supported mobile user agents, independently of viewport width. |
| `modal` | `boolean` | `false` | Use a UI modal with Set/Cancel. |
| `multiDate` | `boolean` | `false` | Multiple date/month/year values; excludes time controls. |
| `multiDateSeparator` | `string` | `','` | Input/output separator for multiple dates. |
| `placement` | `'auto' \| 'top' \| 'bottom' \| 'start' \| 'end'` | `'bottom'` | UI Popper placement: `'top'`, `'bottom'`, `'start'`, `'end'`, or `'auto'`; logical sides follow RTL. |
| `position` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment along the popup edge: `'start'`, `'center'`, or `'end'`. |
| `range` | `boolean` | `false` | Inclusive date-only pair; excludes multi-date and time selection. |
| `rangeSeparator` | `string` | `' – '` | Literal input/output separator between range endpoints. |
| `renderDay` | `((date: DateTime, node: HTMLElement) => void) \| null` | `null` | `(date, node) => void` day-cell customization. |
| `renderMonth` | `((date: DateTime, node: HTMLElement) => void) \| null` | `null` | `(date, node) => void` month-cell customization. |
| `renderYear` | `((date: DateTime, node: HTMLElement) => void) \| null` | `null` | `(date, node) => void` year-cell customization. |
| `showClose` | `boolean` | `false` | Show Close in a non-inline, nonmodal popup. |
| `showToolbar` | `boolean` | `false` | Display the selected date/time above the controls. |
| `sideBySide` | `boolean` | `false` | Display date/time panels together. |
| `spacing` | `number` | `0` | Popup distance from the input in pixels. |
| `timeZone` | `string \| null` | `null` | IANA/fixed-offset zone; null uses DateTime's default. |
| `useCurrent` | `boolean` | `false` | Select now when a single-date input starts empty. |
| `vertical` | `boolean` | `false` | Keep side-by-side panels stacked. |

`DateInput` accepts the date inputs described in [Formats and date inputs](#formats-and-date-inputs), including `null` for an unset date.

## Data attributes

Use kebab-case `data-ui-*` attributes for serializable options. Arrays and objects use JSON. Supply callbacks and DOM nodes through JavaScript.

```html
<label for="days">Available days</label>
<input id="days" class="input-outline" type="text"
    data-ui-toggle="datetimepicker"
    data-ui-format="yyyy-MM-dd"
    data-ui-alt-formats='["dd/MM/yyyy"]'
    data-ui-multi-date="true"
    data-ui-mobile-modal="false">
```

```js
import $ from '@fr0st/query';
import '@fr0st/ui-datetimepicker';

$('[data-ui-toggle="datetimepicker"]').datetimepicker();
```

Data attributes configure options; they do not initialize DateTimePicker by themselves. Initialize the component through the class or fQuery plugin. Changing an option's data attribute after initialization does not reconfigure the existing instance.

## Methods

| Method | Returns | Description |
| --- | --- | --- |
| `DateTimePicker.init(node, options?)` | `DateTimePicker` | Return the existing instance for an element or create one. |
| `clear()` | `void` | Clear the selection and input value. |
| `disable()` | `void` | Disable the native input and picker. Disabled ancestor fieldsets still apply. |
| `dispose()` | `void` | Remove owned events, calendars, modal resources, and registered state, then restore the input's styles and attributes. |
| `enable()` | `void` | Enable the native input and picker. Disabled ancestor fieldsets still apply. |
| `getDate()` | `DateTime \| DateTime[] \| null` | Return the committed selection; arrays are copied in multi-date and range modes. |
| `getMaxDate()` | `DateTime \| null` | Return the parsed upper bound. |
| `getMinDate()` | `DateTime \| null` | Return the parsed lower bound. |
| `getViewDate()` | `DateTime` | Return the current calendar navigation date. |
| `hide()` | `void` | Hide the popup or modal; inline pickers remain visible. |
| `refresh()` | `void` | Revalidate stored selections and redraw, including changed disabled/readonly state. |
| `setDate(value)` | `void` | Parse, validate, normalize, and commit a selection. |
| `setMaxDate(value)` | `void` | Change or remove the upper bound and revalidate. |
| `setMinDate(value)` | `void` | Change or remove the lower bound and revalidate. |
| `show()` | `void` | Show the popup or modal; inline pickers remain visible. |
| `toggle()` | `void` | Toggle popup or modal visibility; inline pickers remain visible. |
| `update()` | `void` | Reposition an open popup. |

Mutators do not return the instance for chaining. `setDate()` and `clear()` do not edit disabled inputs, or readonly inputs unless `ignoreReadonly` applies. Bound setters still update bounds. `refresh()` revalidates stored dates; dispatch native input/change events to synchronize an externally changed input value.

Returned DateTime values are immutable: `date.withHours(10)` returns a new value to pass to `setDate()`.

## Lifecycle

Calling `DateTimePicker.init()` again for the same element returns its existing instance. Dispose the current instance before reinitializing with different options.

An instance exposes its original element as `instance.node` and its shallow-frozen resolved configuration as `instance.options`. Both become `null` after disposal.

`dispose()` releases resources owned by the component and removes its registered instance. Repeated disposal is safe and does not affect a new instance initialized on the same element. Use a new instance before calling other methods after disposal.

## Events

Events fire on the original input. Use fQuery for namespaced listeners:

| Event | Description |
| --- | --- |
| `show.ui.datetimepicker` | Before opening; cancelable. |
| `shown.ui.datetimepicker` | After opening completes. |
| `hide.ui.datetimepicker` | Before closing; cancelable. |
| `hidden.ui.datetimepicker` | After closing completes. |
| `change.ui.datetimepicker` | A changed formatted value is committed; each value is DateTime/null or an array. `event.detail` contains `{ old, new }`. |
| `refresh.ui.datetimepicker` | Panel redraw. `view` is `'date'`/`'time'`; modes are `'days'`, `'months'`, `'years'`, `'hours'`, `'minutes'`, or null for main time controls. `event.detail` contains `{ view, viewMode, viewDate }`. |

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

Importing DateTimePicker registers `datetimepicker` on `fQuery.QuerySet`:

```js
import $ from '@fr0st/query';
import '@fr0st/ui-datetimepicker';

const picker = $('#appointment').datetimepicker({ format: 'yyyy-MM-dd' });
$('#appointment').datetimepicker('setDate', [2026, 9, 15]);
const date = $('#appointment').datetimepicker('getDate');
$('#appointment').datetimepicker('clear');
```

Pass an options object to initialize every matched element, or pass a public method name followed by its arguments. The first component or method result is returned.

The registration key is `datetimepicker`; in UMD, `$.getData(input, UI.DateTimePicker.DATA_KEY)` retrieves an existing instance without creating one.

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

Tab/Shift+Tab move among input/calendar controls. Escape and completed popup selection restore input focus. UI handles modal focus restoration, nested modals, and focus redirection from outside page controls. Its shared focus trap can allow Tab to reach browser chrome when a modal is the document's last focusable content.

Inline mode hides the native input from focus and the accessibility tree. Give the visible calendar a nearby heading and descriptive text. Reduced motion disables picker animations. Custom rendering must preserve generated accessibility and focus attributes.

## Forms

The named native input submits the formatted string, including the multi-date separator. Reset restores its `defaultValue`, stored selection, and calendar view without emitting a picker change. Canceled resets do nothing; disposal cancels pending reset work.

Native `required` checks an empty text input; it does not validate date syntax, bounds, or callback rules. `keepInvalid` can preserve nonempty invalid text. Apply application/server validation as needed. Inline inputs are hidden, so browser invalid-focus behavior is unsuitable for inline required controls; use a visible popup input for native required validation.

Disabled fieldsets apply and exclude the input from submission. Changes to the input's disabled/readonly state and ancestor fieldsets' disabled state automatically update picker controls without redrawing panels. An open popup or modal closes when the input becomes uneditable, respecting `ignoreReadonly`. For an external value change, dispatch the corresponding event:

```js
const input = document.querySelector('#appointment');
input.value = '2026-09-16 10:30';
input.dispatchEvent(new Event('change', { bubbles: true }));
```

## Customization

Set `DateTimePicker.defaults`, `DateTimePicker.classes`, `DateTimePicker.icons`, and `DateTimePicker.lang` before initialization. Their keys are listed in the [class source](./src/js/date-time-picker.js). Preserve structural classes and accessible labels. Locale formats calendar text; translate `lang` separately for controls such as Set, Cancel, and Next Month.

```js
DateTimePicker.defaults.locale = 'en-GB';
DateTimePicker.lang.set = 'Apply';

DateTimePicker.getDefaultDateFormat('en-GB'); // dd/MM/yyyy
DateTimePicker.getDefaultTimeFormat('en-US', false); // HH:mm
DateTimePicker.getDefaultFormat('en-US', true); // Date and 12-hour time.
```

All three helpers return strings. The optional boolean on time/combined helpers selects a 12-hour clock; omitted, it follows the locale.

### Custom Sass builds

Install Sass and create an application stylesheet to customize the component:

```bash
npm i -D sass
```

`src/styles.scss`

```scss
@use "@fr0st/ui-datetimepicker/src/scss/datetimepicker" with (
    $datetimepicker-width: 320px,
    $datetimepicker-wide-width: 640px
);
```

Compile the entry point with npm package resolution enabled:

```bash
npx sass --load-path=node_modules src/styles.scss dist/styles.css
```

The `datetimepicker` module forwards the [component variables](./src/scss/_vars.scss), all of which have `!default` values. Include Frost UI CSS separately. Build tools that already resolve Sass modules from npm packages do not need the explicit load path.

## Themes and RTL

Frost UI follows the user's preferred color scheme by default. Set `data-ui-theme="light"` or `data-ui-theme="dark"` on the document or an ancestor to select a theme explicitly.

Set `dir="rtl"` on the document or a containing region for RTL alignment and the mirrored today marker. Use logical Popper placements (`start`/`end`) for horizontal attachment.

Component CSS variables are `--ui-datetimepicker-z-index`, `--ui-datetimepicker-bg`, `--ui-datetimepicker-border-width`, `--ui-datetimepicker-border-color`, and `--ui-datetimepicker-duration` (set from the `duration` option). Override them on the rendered `.datetimepicker`, not only the input:

```css
.datetimepicker {
    --ui-datetimepicker-border-color: var(--ui-primary);
}
```

Use Sass for widths, today-marker dimensions, and action styling. Inline/modal variants override their own background/border defaults.

## Development

Install dependencies with `npm ci`, then install Playwright browsers with `npx playwright install --with-deps`.

```bash
npm test
npm run lint
npm run build
```

`npm test` rebuilds the bundles, then runs the Playwright suite in Chromium, Firefox, and WebKit. `npm run test:browser` runs the suite against the existing bundles, so rebuild after changing source files.

After building, `npm run test:coverage` runs Chromium tests and writes coverage reports to `coverage/`.

`npm run test:headed` and `npm run test:ui` also use the existing bundles and open headed browsers or the Playwright UI.

To view the demo, open `demo/index.html` in your browser after building.

## License

Frost UI DateTimePicker is released under the [MIT License](./LICENSE).
