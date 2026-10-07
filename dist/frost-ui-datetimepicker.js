(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ?  factory(exports, require('@fr0st/query'), require('@fr0st/ui'), require('@fr0st/datetime')) :
  typeof define === 'function' && define.amd ? define(['exports', '@fr0st/query', '@fr0st/ui', '@fr0st/datetime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.UI = global.UI || {}), global.fQuery,global.UI,global.DateTime));
})(this, function(exports, _fr0st_query, _fr0st_ui, _fr0st_datetime) {
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
_fr0st_query = __toESM(_fr0st_query, 1);
_fr0st_datetime = __toESM(_fr0st_datetime, 1);

//#region src/js/comparisons.js
/**
	* Checks whether a date is after another date (day).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is after the other date.
	*/
	function isAfterDay(a, b) {
		return isAfterMonth(a, b) || isSameMonth(a, b) && a.getDate() > b.getDate();
	}
	/**
	* Checks whether a date is after another date (month).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is after the other date.
	*/
	function isAfterMonth(a, b) {
		return isAfterYear(a, b) || isSameYear(a, b) && a.getMonth() > b.getMonth();
	}
	/**
	* Checks whether a date is after another date (instant).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is after the other date.
	*/
	function isAfterInstant(a, b) {
		return a.getTime() > b.getTime();
	}
	/**
	* Checks whether a date is after another date (year).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is after the other date.
	*/
	function isAfterYear(a, b) {
		return a.getYear() > b.getYear();
	}
	/**
	* Checks whether a date is before another date (day).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is before the other date.
	*/
	function isBeforeDay(a, b) {
		return isBeforeMonth(a, b) || isSameMonth(a, b) && a.getDate() < b.getDate();
	}
	/**
	* Checks whether a date is before another date (month).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is before the other date.
	*/
	function isBeforeMonth(a, b) {
		return isBeforeYear(a, b) || isSameYear(a, b) && a.getMonth() < b.getMonth();
	}
	/**
	* Checks whether a date is before another date (instant).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is before the other date.
	*/
	function isBeforeInstant(a, b) {
		return a.getTime() < b.getTime();
	}
	/**
	* Checks whether a date is before another date (year).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is before the other date.
	*/
	function isBeforeYear(a, b) {
		return a.getYear() < b.getYear();
	}
	/**
	* Checks whether a date is equal to another date (day).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is equal to the other date.
	*/
	function isSameDay(a, b) {
		return isSameMonth(a, b) && a.getDate() === b.getDate();
	}
	/**
	* Checks whether a date is equal to another date (month).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is equal to the other date.
	*/
	function isSameMonth(a, b) {
		return isSameYear(a, b) && a.getMonth() === b.getMonth();
	}
	/**
	* Checks whether a date is equal to another date (instant).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is equal to the other date.
	*/
	function isSameInstant(a, b) {
		return a.getTime() === b.getTime();
	}
	/**
	* Checks whether a date is equal to another date (year).
	* @param {DateTime} a The date to test.
	* @param {DateTime} b The date to compare against.
	* @returns {boolean} Whether the date is equal to the other date.
	*/
	function isSameYear(a, b) {
		return a.getYear() === b.getYear();
	}

//#endregion
//#region src/js/formats.js
	var dayPeriods = {};
	var defaultFormats = {};
	var defaultDateFormats = {};
	var defaultTimeFormats = {};
	/**
	* Checks a locale for day period component (and cache).
	* @param {string} locale The locale to check.
	* @returns {boolean} Whether the locale uses a day period component.
	*/
	function checkDayPeriod(locale) {
		if (!(locale in dayPeriods)) {
			const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit" });
			dayPeriods[locale] = Boolean(formatter.formatToParts(/* @__PURE__ */ new Date()).find((part) => part.type === "dayPeriod"));
		}
		return dayPeriods[locale];
	}
	/**
	* Gets the default date format for a locale.
	* @param {string} locale The input locale.
	* @returns {string} The default date format.
	*/
	function getDefaultDateFormat(locale) {
		if (!(locale in defaultDateFormats)) defaultDateFormats[locale] = formatFromParts(locale, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		});
		return defaultDateFormats[locale];
	}
	/**
	* Gets the default format for a locale.
	* @param {string} locale The input locale.
	* @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock; defaults to the locale.
	* @returns {string} The default format.
	*/
	function getDefaultFormat(locale, hasDayPeriod = checkDayPeriod(locale)) {
		const key = `${locale}:${hasDayPeriod}`;
		if (!(key in defaultFormats)) defaultFormats[key] = formatFromParts(locale, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		}, hasDayPeriod);
		return defaultFormats[key];
	}
	/**
	* Gets the default time format for a locale.
	* @param {string} locale The input locale.
	* @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock; defaults to the locale.
	* @returns {string} The default time format.
	*/
	function getDefaultTimeFormat(locale, hasDayPeriod = checkDayPeriod(locale)) {
		const key = `${locale}:${hasDayPeriod}`;
		if (!(key in defaultTimeFormats)) defaultTimeFormats[key] = formatFromParts(locale, {
			hour: "2-digit",
			minute: "2-digit"
		}, hasDayPeriod);
		return defaultTimeFormats[key];
	}
	/**
	* Creates a date format from a locale and options.
	* @param {string} locale The input locale.
	* @param {Intl.DateTimeFormatOptions} options Options for the formatter.
	* @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock.
	* @returns {string} The date format.
	*/
	function formatFromParts(locale, options, hasDayPeriod) {
		return new Intl.DateTimeFormat(locale, {
			...options,
			hour12: hasDayPeriod
		}).formatToParts(/* @__PURE__ */ new Date()).map((part) => {
			switch (part.type) {
				case "year": return "yyyy";
				case "month": return "MM";
				case "day": return "dd";
				case "hour": return hasDayPeriod ? "hh" : "HH";
				case "minute": return "mm";
				case "dayPeriod": return "a";
			}
			if (part.value === ", ") return " ";
			if (!/[a-z]/i.test(part.value)) return part.value;
			return `'${part.value}'`;
		}).join("");
	}

//#endregion
//#region src/js/helpers.js
/**
	* Adjusts a date by a signed number of units.
	* @param {DateTime} date The starting date.
	* @param {'day'|'week'|'month'|'year'|'hour'|'minute'} unit The date/time unit.
	* @param {number} amount The amount to add; negative values subtract.
	* @returns {DateTime} The adjusted date.
	*/
	function adjustDate(date, unit, amount) {
		switch (unit) {
			case "day": return date.addDays(amount);
			case "week": return date.addWeeks(amount);
			case "month": return date.addMonths(amount);
			case "year": return date.addYears(amount);
			case "hour": return date.addHours(amount);
			case "minute": return date.addMinutes(amount);
		}
	}
	/**
	* Creates a column grid inside a full-width table cell.
	* @param {Record<string, string>} classes The component classes.
	* @param {HTMLElement} tbody The table body.
	* @returns {HTMLElement} The grid row to append choices to.
	*/
	function createGrid(classes, tbody) {
		const tr = _fr0st_query.default.create("tr");
		_fr0st_query.default.append(tbody, tr);
		const td = _fr0st_query.default.create("td", {
			class: classes.rowContainer,
			attributes: { colspan: 7 }
		});
		_fr0st_query.default.append(tr, td);
		const row = _fr0st_query.default.create("div", { class: classes.row });
		_fr0st_query.default.append(td, row);
		return row;
	}
	/**
	* Creates a table.
	* @param {Record<string, string>} classes The component classes.
	* @param {Record<string, string>} icons The component icons.
	* @param {object} options Options for rendering the table.
	* @returns {HTMLElement} The new table.
	*/
	function createTable(classes, icons, options) {
		const table = _fr0st_query.default.create("table", { class: classes.table });
		if (options.header) {
			const thead = _fr0st_query.default.create("thead");
			_fr0st_query.default.append(table, thead);
			const tr = _fr0st_query.default.create("tr");
			_fr0st_query.default.append(thead, tr);
			const prevTd = _fr0st_query.default.create("th", {
				html: icons.left,
				class: classes.navigation
			});
			if (!options.header.prev) _fr0st_query.default.addClass(prevTd, classes.disabled);
			else {
				_fr0st_query.default.addClass(prevTd, classes.action);
				_fr0st_query.default.setDataset(prevTd, options.header.prev.dataset);
				_fr0st_query.default.setAttribute(prevTd, {
					role: "button",
					tabindex: 0,
					...options.header.prev.attributes
				});
			}
			_fr0st_query.default.append(tr, prevTd);
			const titleTd = _fr0st_query.default.create("th", {
				class: classes.title,
				text: options.header.title,
				attributes: {
					colspan: 5,
					...options.header.attributes
				}
			});
			if (options.header.dataset) {
				_fr0st_query.default.addClass(titleTd, classes.action);
				_fr0st_query.default.setDataset(titleTd, options.header.dataset);
				_fr0st_query.default.setAttribute(titleTd, {
					role: "button",
					tabindex: 0
				});
			}
			if (options.header.wide) _fr0st_query.default.addClass(titleTd, classes.titleWide);
			_fr0st_query.default.append(tr, titleTd);
			const nextTd = _fr0st_query.default.create("th", {
				html: icons.right,
				class: classes.navigation
			});
			if (!options.header.next) _fr0st_query.default.addClass(nextTd, classes.disabled);
			else {
				_fr0st_query.default.addClass(nextTd, classes.action);
				_fr0st_query.default.setDataset(nextTd, options.header.next.dataset);
				_fr0st_query.default.setAttribute(nextTd, {
					role: "button",
					tabindex: 0,
					...options.header.next.attributes
				});
			}
			_fr0st_query.default.append(tr, nextTd);
			if (options.head) options.head(thead);
		}
		const tbody = _fr0st_query.default.create("tbody");
		_fr0st_query.default.append(table, tbody);
		options.body(tbody);
		return table;
	}
	/**
	* Gets the key for a selected day, month, or year.
	* @param {DateTime} date The date.
	* @param {'days'|'months'|'years'} minView The calendar precision.
	* @returns {string} The selection key.
	*/
	function getDateKey(date, minView) {
		if (minView === "years") return String(date.getYear());
		if (minView === "months") return `${date.getYear()}-${date.getMonth()}`;
		return `${date.getYear()}-${date.getMonth()}-${date.getDate()}`;
	}
	/**
	* Calculates the calendar date reached by a navigation key.
	* @param {DateTime} date The currently focused date.
	* @param {'days'|'months'|'years'} view The calendar view.
	* @param {string} key The keyboard event code.
	* @param {boolean} ctrlKey Whether Control is pressed.
	* @returns {DateTime|null} The candidate date, or null for an unrelated key.
	*/
	function getKeyboardDate(date, view, key, ctrlKey) {
		switch (key) {
			case "ArrowUp":
			case "ArrowDown":
			case "ArrowLeft":
			case "ArrowRight": {
				const vertical = key === "ArrowUp" || key === "ArrowDown";
				const direction = key === "ArrowUp" || key === "ArrowLeft" ? -1 : 1;
				if (view === "days") {
					let unit = vertical ? "week" : "day";
					if (ctrlKey) unit = vertical ? "year" : "month";
					return adjustDate(date, unit, direction);
				}
				return adjustDate(date, view === "months" ? "month" : "year", direction * (vertical ? 3 : 1));
			}
			case "Home": return view === "days" ? date.startOfWeek() : date;
			case "End": return view === "days" ? date.endOfWeek() : date;
			case "PageUp":
			case "PageDown": return view === "days" ? adjustDate(date, "month", key === "PageUp" ? -1 : 1) : date;
			default: return null;
		}
	}
	/**
	* Renders a time column.
	* @param {Record<string, string>} classes The component classes.
	* @param {Record<string, string>} icons The component icons.
	* @param {object} options Options for rendering the column.
	*/
	function renderTimeColumn(classes, icons, options) {
		const upTd = _fr0st_query.default.create("td", {
			html: icons.up,
			class: [
				classes.navigation,
				classes.time,
				classes.spacingTimeNav
			],
			style: { width: `${options.cellWidth}%` }
		});
		if (!options.increment) _fr0st_query.default.addClass(upTd, classes.disabled);
		else {
			_fr0st_query.default.addClass(upTd, classes.action);
			_fr0st_query.default.setDataset(upTd, options.increment.dataset);
			_fr0st_query.default.setAttribute(upTd, {
				role: "button",
				tabindex: 0,
				...options.increment.attributes
			});
		}
		_fr0st_query.default.append(options.upTr, upTd);
		const selectTd = _fr0st_query.default.create("td", {
			text: options.select.text,
			class: [
				classes.action,
				classes.time,
				classes.spacingTime
			],
			dataset: options.select.dataset,
			attributes: {
				role: "button",
				tabindex: 0,
				...options.select.attributes
			}
		});
		_fr0st_query.default.append(options.timeTr, selectTd);
		const downTd = _fr0st_query.default.create("td", {
			html: icons.down,
			class: [
				classes.navigation,
				classes.time,
				classes.spacingTimeNav
			]
		});
		if (!options.decrement) _fr0st_query.default.addClass(downTd, classes.disabled);
		else {
			_fr0st_query.default.addClass(downTd, classes.action);
			_fr0st_query.default.setDataset(downTd, options.decrement.dataset);
			_fr0st_query.default.setAttribute(downTd, {
				role: "button",
				tabindex: 0,
				...options.decrement.attributes
			});
		}
		_fr0st_query.default.append(options.downTr, downTd);
	}
	/**
	* Renders a time separator column.
	* @param {Record<string, string>} classes The component classes.
	* @param {object} options Options for rendering the separator column.
	*/
	function renderTimeSeparator(classes, options) {
		const separatorUpTd = _fr0st_query.default.create("td", { style: { width: `${options.separatorWidth}%` } });
		_fr0st_query.default.append(options.upTr, separatorUpTd);
		const separatorTd = _fr0st_query.default.create("td", {
			text: ":",
			class: [classes.time, classes.spacingSeparator]
		});
		_fr0st_query.default.append(options.timeTr, separatorTd);
		const separatorDownTd = _fr0st_query.default.create("td");
		_fr0st_query.default.append(options.downTr, separatorDownTd);
	}

//#endregion
//#region src/js/date-time-picker.js
/**
	* A date string in the configured format, UNIX seconds, a 1-based date tuple,
	* a native Date, a DateTime, or null to clear a value.
	* @typedef {string|number|number[]|Date|DateTime|null} DateInput
	*/
	/**
	* @typedef {object} DateTimePickerOptions
	* @property {string|null} [format=null] The date/time format; null derives it from the locale.
	* @property {string[]} [altFormats=[]] Additional accepted input formats.
	* @property {string|null} [ariaFormat='LLLL d, yyyy'] The accessible date label format.
	* @property {string|null} [timeZone=null] The time zone; null uses DateTime's default.
	* @property {string|null} [locale=null] The locale; null uses DateTime's default.
	* @property {DateInput} [defaultDate=null] The initial view when no date is selected.
	* @property {'days'|'months'|'years'|null} [defaultView=null] The initial calendar view.
	* @property {DateInput} [minDate=null] The inclusive minimum date.
	* @property {DateInput} [maxDate=null] The inclusive maximum date.
	* @property {((date: DateTime) => boolean)|null} [isValidDay=null] Tests selectable days.
	* @property {((date: DateTime) => boolean)|null} [isValidMonth=null] Tests selectable months.
	* @property {((date: DateTime) => boolean)|null} [isValidTime=null] Tests selectable times.
	* @property {((date: DateTime) => boolean)|null} [isValidYear=null] Tests selectable years.
	* @property {((date: DateTime, node: HTMLElement) => void)|null} [renderDay=null] Customizes a day cell.
	* @property {((date: DateTime, node: HTMLElement) => void)|null} [renderMonth=null] Customizes a month cell.
	* @property {((date: DateTime, node: HTMLElement) => void)|null} [renderYear=null] Customizes a year cell.
	* @property {boolean} [multiDate=false] Whether to allow multiple dates; excludes time formats.
	* @property {string} [multiDateSeparator=','] The separator between formatted dates.
	* @property {number} [minuteStepping=1] The minute interval, an integer from 1 to 60.
	* @property {boolean} [useCurrent=false] Whether an empty single-date input starts at the current time.
	* @property {boolean} [keepOpen=false] Whether to keep the calendar open after selection.
	* @property {boolean} [inline=false] Whether to render in place and hide the input.
	* @property {boolean} [sideBySide=false] Whether date and time are displayed together.
	* @property {boolean} [vertical=false] Whether side-by-side content is stacked vertically.
	* @property {boolean} [showToolbar=false] Whether to display the selected date/time toolbar.
	* @property {boolean} [showClose=false] Whether to show a close action in the popup.
	* @property {boolean} [keepInvalid=false] Whether to preserve invalid typed input.
	* @property {boolean} [ignoreReadonly=false] Whether readonly inputs remain editable through the picker.
	* @property {boolean} [modal=false] Whether to use a modal; inline mode takes precedence.
	* @property {boolean} [mobileModal=true] Whether supported mobile user agents use a modal.
	* @property {number} [duration=100] The popup animation duration in milliseconds.
	* @property {string|HTMLElement|null} [appendTo=null] The popup or modal container.
	* @property {'top'|'bottom'|'left'|'right'} [placement='bottom'] The preferred popup placement.
	* @property {'start'|'center'|'end'} [position='start'] The popup alignment.
	* @property {boolean} [fixed=false] Whether Popper preserves the preferred placement.
	* @property {number} [spacing=0] The distance from the input.
	* @property {number|false|null} [minContact=false] The minimum contact with the input.
	*/
	/**
	* Selects dates and times using a popup, inline calendar, or modal.
	* @augments {BaseComponent<DateTimePickerOptions>}
	*/
	var DateTimePicker = class extends _fr0st_ui.BaseComponent {
		/** @type {Record<string, string>} */
		static classes = {
			action: "datetimepicker-action",
			active: "datetimepicker-active",
			column: "col d-flex flex-column",
			container: "row row-cols-1 g-2",
			containerColumns: "row-cols-lg-2",
			dateColumn: "col-4 px-1 py-2",
			days: "text-primary small fw-light",
			disabled: "datetimepicker-disabled",
			hourColumn: "col-3 p-1",
			menu: "datetimepicker",
			menuInline: "datetimepicker-inline",
			menuShadow: "shadow-sm",
			menuWide: "datetimepicker-wide",
			modal: "modal",
			modalBody: "modal-body",
			modalBtnPrimary: "btn btn-primary ripple",
			modalBtnSecondary: "btn btn-secondary ripple",
			modalContent: "modal-content",
			modalDialog: "modal-dialog modal-dialog-centered modal-sm",
			modalFooter: "modal-footer",
			modalHeader: "modal-header",
			modalTitle: "modal-title",
			navigation: "text-primary fs-5 lh-1",
			periodButton: "btn btn-primary d-block",
			row: "row g-0",
			rowContainer: "p-0",
			spacingNav: "py-2",
			spacingSeparator: "py-2",
			spacingTime: "py-2 px-0",
			spacingTimeNav: "py-4 px-0",
			table: "table table-borderless table-sm text-center mx-0 my-auto",
			tertiary: "text-body-tertiary",
			time: "datetimepicker-time",
			timeColumn: "col-3 px-1 py-2",
			title: "fw-bold",
			titleWide: "w-100",
			today: "datetimepicker-today",
			toolbarDate: "fs-3 mb-0",
			toolbarRow: "d-flex align-items-end justify-content-between",
			toolbarPadding: "p-3",
			toolbarTime: "fs-3 mb-0",
			toolbarYear: "small text-body-secondary mb-0"
		};
		/** @type {DateTimePickerOptions} */
		static defaults = {
			format: null,
			altFormats: [],
			ariaFormat: "LLLL d, yyyy",
			timeZone: null,
			locale: null,
			defaultDate: null,
			defaultView: null,
			minDate: null,
			maxDate: null,
			isValidDay: null,
			isValidMonth: null,
			isValidTime: null,
			isValidYear: null,
			renderDay: null,
			renderMonth: null,
			renderYear: null,
			multiDate: false,
			multiDateSeparator: ",",
			minuteStepping: 1,
			useCurrent: false,
			keepOpen: false,
			inline: false,
			sideBySide: false,
			vertical: false,
			showToolbar: false,
			showClose: false,
			keepInvalid: false,
			ignoreReadonly: false,
			modal: false,
			mobileModal: true,
			duration: 100,
			appendTo: null,
			placement: "bottom",
			position: "start",
			fixed: false,
			spacing: 0,
			minContact: false
		};
		/** @type {Record<string, string>} */
		static icons = {
			close: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><title>check</title><path d=\"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z\" fill=\"currentColor\" /></svg>",
			date: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path d=\"M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1\" fill=\"currentColor\"/></svg>",
			down: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path d=\"M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42z\" fill=\"currentColor\"/></svg>",
			left: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path d=\"M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6l1.41-1.42z\" fill=\"currentColor\"/></svg>",
			right: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path d=\"M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6l-1.41-1.42z\" fill=\"currentColor\"/></svg>",
			time: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path d=\"M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5z\" fill=\"currentColor\"/></svg>",
			up: "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path d=\"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6l1.41 1.41z\" fill=\"currentColor\"/></svg>"
		};
		/** @type {Record<string, string>} */
		static lang = {
			cancel: "Cancel",
			close: "Close",
			decrementHour: "Decrement Hour",
			decrementMinute: "Decrement Minute",
			incrementHour: "Increment Hour",
			incrementMinute: "Increment Minute",
			nextDecade: "Next Decade",
			nextMonth: "Next Month",
			nextYear: "Next Year",
			prevDecade: "Previous Decade",
			prevMonth: "Previous Month",
			prevYear: "Previous Year",
			selectDate: "Select Date",
			selectDateTime: "Select Date & Time",
			selectHour: "Select Hour",
			selectMinute: "Select Minute",
			selectMonth: "Select Month",
			selectTime: "Select Time",
			selectYear: "Select Year",
			set: "Set",
			togglePeriod: "Toggle Period"
		};
		#attributes = /* @__PURE__ */ new Map();
		#closeTable = null;
		#container = null;
		#date = null;
		#dateContainer = null;
		#dateItems = [];
		#dateOptions = null;
		#dates = [];
		#defaultDate = null;
		#defaultView;
		#focusedDateItem = null;
		#focusedTimeItem = null;
		#form = null;
		#format;
		#hasDate;
		#hasHours;
		#hasMinutes;
		#hasMonth;
		#hasYear;
		#keepDate;
		#lifecycleEvent = false;
		#maxDate = null;
		#menuNode = null;
		#minDate = null;
		#minView;
		#modal = null;
		#observer = null;
		#open = false;
		#originalDate = null;
		#popper = null;
		#refreshing = false;
		#releaseDisplay = null;
		#resetTimers = /* @__PURE__ */ new Set();
		#selectionId = 0;
		#setBtn = null;
		#showDateTable;
		#showTimeTable;
		#timeContainer = null;
		#timeItems = [];
		#timeViewMode;
		#toolbarDate = null;
		#toolbarTime = null;
		#toolbarYear = null;
		#transitionId = 0;
		#useDayPeriod;
		#useModal;
		#viewDate = null;
		#viewMode;
		#viewTransitionId = 0;
		/**
		* Gets the default date format for a locale.
		* @param {string} locale The locale.
		* @returns {string} The date format.
		*/
		static getDefaultDateFormat(locale) {
			return getDefaultDateFormat(locale);
		}
		/**
		* Gets the default date/time format for a locale.
		* @param {string} locale The locale.
		* @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock.
		* @returns {string} The date/time format.
		*/
		static getDefaultFormat(locale, hasDayPeriod) {
			return getDefaultFormat(locale, hasDayPeriod);
		}
		/**
		* Gets the default time format for a locale.
		* @param {string} locale The locale.
		* @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock.
		* @returns {string} The time format.
		*/
		static getDefaultTimeFormat(locale, hasDayPeriod) {
			return getDefaultTimeFormat(locale, hasDayPeriod);
		}
		/**
		* Creates a DateTimePicker.
		* @param {HTMLElement} node The input node.
		* @param {DateTimePickerOptions} [options] The component options.
		*/
		constructor(node, options) {
			if (!_fr0st_query.default._isElement(node) || !_fr0st_query.default.is(node, "input")) throw new TypeError("DateTimePicker must be created on an input element.");
			super(node, options);
			try {
				this.#attributes = new Map([
					"aria-controls",
					"aria-expanded",
					"aria-haspopup"
				].map((name) => [name, _fr0st_query.default.getAttribute(node, name)]));
				this.#form = _fr0st_query.default.getProperty(node, "form");
				this.#dateOptions = {
					locale: this.options.locale || _fr0st_datetime.default.getDefaultLocale(),
					timeZone: this.options.timeZone || _fr0st_datetime.default.getDefaultTimeZone()
				};
				if (!Number.isInteger(this.options.minuteStepping) || this.options.minuteStepping < 1 || this.options.minuteStepping > 60) throw new RangeError("minuteStepping must be an integer between 1 and 60.");
				this.#useDayPeriod = checkDayPeriod(this.#dateOptions.locale);
				this.#format = this.options.format;
				if (!this.#format) this.#format = this.options.multiDate ? getDefaultDateFormat(this.#dateOptions.locale) : getDefaultFormat(this.#dateOptions.locale, this.#useDayPeriod);
				const mobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
				this.#useModal = !this.options.inline && (this.options.modal || this.options.mobileModal && mobile);
				this.#checkFormat();
				this.#minDate = this.#parseDate(this.options.minDate);
				this.#maxDate = this.#parseDate(this.options.maxDate);
				const value = _fr0st_query.default.getValue(this.node);
				if (this.options.multiDate) this.#dates = this.#normalizeDates(value.split(this.options.multiDateSeparator).map((value) => this.#makeDate(value)));
				else {
					this.#date = this.#makeDate(value);
					if (!this.#date && this.options.useCurrent) this.#date = this.#now();
					if (this.#date && !this.#isValid(this.#date)) this.#date = null;
				}
				if (!this.node) return;
				this.#defaultDate = this.#parseDate(this.options.defaultDate);
				if (!this.#defaultDate) this.#defaultDate = this.#now();
				if (this.#hasHours && !this.#isValid(this.#defaultDate)) this.#defaultDate = this.#findValidTime(this.#defaultDate) || this.#defaultDate;
				if (!this.node) return;
				if (this.#date || this.options.multiDate && this.#dates.length || value && !this.options.keepInvalid) this.#updateValue();
				this.#render();
				this.#events();
				this.#resetView();
				if (this.#useModal) {
					this.#renderModal();
					this.#eventsModal();
				} else if (this.options.inline) this.#refresh();
				this.#refreshDisabled();
				_fr0st_query.default.setData(this.#menuNode, { input: this.node });
			} catch (error) {
				this.dispose();
				throw error;
			}
		}
		/**
		* Clears the current value.
		*/
		clear() {
			this.setDate(null);
		}
		/**
		* Disables the DateTimePicker.
		*/
		disable() {
			_fr0st_query.default.setAttribute(this.node, { disabled: true });
			this.hide();
			this.#refreshDisabled();
			this.#refresh();
		}
		/** @inheritdoc */
		dispose() {
			if (!this.node) return;
			++this.#transitionId;
			++this.#viewTransitionId;
			++this.#selectionId;
			for (const timer of this.#resetTimers) clearTimeout(timer);
			this.#resetTimers.clear();
			this.#observer?.disconnect();
			for (const node of [
				this.#menuNode,
				this.#dateContainer,
				this.#timeContainer
			]) if (node) _fr0st_query.default.stop(node);
			this.#popper?.dispose();
			if (this.#modal) {
				_fr0st_query.default.getData(this.#modal, _fr0st_ui.Modal.DATA_KEY)?.dispose();
				_fr0st_query.default.remove(this.#modal);
			}
			for (const container of [this.#dateContainer, this.#timeContainer]) if (container && !_fr0st_query.default.hasDescendent(this.#menuNode, container)) _fr0st_query.default.remove(container);
			_fr0st_query.default.remove(this.#menuNode);
			this.#releaseDisplay?.();
			for (const [name, value] of this.#attributes) if (value === null) _fr0st_query.default.removeAttribute(this.node, name);
			else _fr0st_query.default.setAttribute(this.node, { [name]: value });
			this.#open = false;
			this.#date = null;
			this.#dates = null;
			this.#originalDate = null;
			this.#minDate = null;
			this.#maxDate = null;
			this.#viewDate = null;
			this.#defaultDate = null;
			this.#dateOptions = null;
			this.#menuNode = null;
			this.#modal = null;
			this.#observer = null;
			this.#popper = null;
			this.#container = null;
			this.#dateContainer = null;
			this.#dateItems = [];
			this.#focusedDateItem = null;
			this.#focusedTimeItem = null;
			this.#timeContainer = null;
			this.#timeItems = [];
			this.#showTimeTable = null;
			this.#showDateTable = null;
			this.#closeTable = null;
			this.#toolbarDate = null;
			this.#toolbarTime = null;
			this.#toolbarYear = null;
			this.#setBtn = null;
			this.#form = null;
			this.#releaseDisplay = null;
			super.dispose();
		}
		/**
		* Enables the DateTimePicker.
		*/
		enable() {
			_fr0st_query.default.removeAttribute(this.node, "disabled");
			this.#refreshDisabled();
			this.#refresh();
		}
		/**
		* Gets the current date(s).
		* @returns {DateTime|null|DateTime[]} The current date(s).
		*/
		getDate() {
			const committed = this.options.multiDate ? this.#dates : this.#date;
			const date = this.#useModal && this.#open ? this.#originalDate : committed;
			return Array.isArray(date) ? date.slice() : date;
		}
		/**
		* Gets the maximum date.
		* @returns {DateTime|null} The maximum date.
		*/
		getMaxDate() {
			return this.#maxDate;
		}
		/**
		* Gets the minimum date.
		* @returns {DateTime|null} The minimum date.
		*/
		getMinDate() {
			return this.#minDate;
		}
		/**
		* Gets the view date.
		* @returns {DateTime} The view date.
		*/
		getViewDate() {
			return this.#viewDate;
		}
		/**
		* Hides the DateTimePicker.
		*/
		hide() {
			if (!this.node || this.options.inline || !this.#open) return;
			if (this.#useModal) {
				_fr0st_ui.Modal.init(this.#modal).hide();
				return;
			}
			if (!this.#allowEvent("hide")) return;
			this.#open = false;
			_fr0st_query.default.setAttribute(this.node, { "aria-expanded": false });
			_fr0st_query.default.setAttribute(_fr0st_query.default.find("[tabindex]", this.#menuNode), { tabindex: -1 });
			const menu = this.#menuNode;
			const id = ++this.#transitionId;
			_fr0st_query.default.stop(menu);
			_fr0st_query.default.setDataset(menu, { uiAnimating: "out" });
			_fr0st_query.default.fadeOut(menu, { duration: this.#duration() }).then(() => {
				if (!this.node || id !== this.#transitionId) return;
				this.#popper?.dispose();
				this.#popper = null;
				_fr0st_query.default.detach(menu);
				_fr0st_query.default.removeDataset(menu, "uiAnimating");
				_fr0st_query.default.triggerEvent(this.node, "hidden.ui.datetimepicker");
			}).catch(() => {});
		}
		/**
		* Refreshes the DateTimePicker.
		*/
		refresh() {
			if (!this.node) return;
			this.#refreshDisabled();
			if (!this.#isEditable()) {
				this.#refresh();
				return;
			}
			if (this.options.multiDate) this.#setDates(this.#dates);
			else this.#setDate(this.#date);
		}
		/**
		* Sets the current date(s).
		* @param {DateInput|DateInput[]} date The input date, or an array of dates in multi-date mode.
		*/
		setDate(date) {
			if (this.options.multiDate) {
				const dates = this.#parseDates(date);
				this.#setDates(dates);
			} else {
				date = this.#parseDate(date);
				this.#setDate(date);
			}
		}
		/**
		* Sets the maximum date.
		* @param {DateInput} maxDate The input date(s).
		*/
		setMaxDate(maxDate) {
			this.#maxDate = this.#parseDate(maxDate);
			this.refresh();
		}
		/**
		* Sets the minimum date.
		* @param {DateInput} minDate The input date(s).
		*/
		setMinDate(minDate) {
			this.#minDate = this.#parseDate(minDate);
			this.refresh();
		}
		/**
		* Shows the DateTimePicker.
		*/
		show() {
			if (!this.node || this.options.inline || this.#open || !this.#isEditable()) return;
			if (this.#useModal) {
				if (this.options.appendTo) _fr0st_query.default.append(this.options.appendTo, this.#modal);
				else {
					const parentModal = _fr0st_query.default.closest(this.node, ".modal").shift();
					_fr0st_query.default.after(parentModal || this.node, this.#modal);
				}
				this.#resetView();
				this.#refresh();
				if (this.node) _fr0st_ui.Modal.init(this.#modal).show(this.node);
				return;
			}
			if (!this.#allowEvent("show")) return;
			this.#open = true;
			_fr0st_query.default.setAttribute(this.node, { "aria-expanded": true });
			const menu = this.#menuNode;
			const id = ++this.#transitionId;
			_fr0st_query.default.stop(menu);
			_fr0st_query.default.setDataset(menu, { uiAnimating: "in" });
			if (this.options.appendTo) _fr0st_query.default.append(this.options.appendTo, menu);
			else _fr0st_query.default.after(this.node, menu);
			this.#resetView();
			this.#refresh();
			if (!this.node || id !== this.#transitionId) return;
			this.#popper?.dispose();
			this.#popper = new _fr0st_ui.Popper(menu, {
				reference: this.node,
				placement: this.options.placement,
				position: this.options.position,
				fixed: this.options.fixed,
				spacing: this.options.spacing,
				minContact: this.options.minContact
			});
			_fr0st_query.default.fadeIn(menu, { duration: this.#duration() }).then(() => {
				if (!this.node || id !== this.#transitionId) return;
				_fr0st_query.default.removeDataset(menu, "uiAnimating");
				_fr0st_query.default.triggerEvent(this.node, "shown.ui.datetimepicker");
			}).catch(() => {});
		}
		/**
		* Toggles the DateTimePicker.
		*/
		toggle() {
			if (this.#open) this.hide();
			else this.show();
		}
		/**
		* Updates the DateTimePicker position.
		*/
		update() {
			this.#popper?.update();
		}
		/**
		* Runs a cancellable lifecycle event without recursive show/hide calls.
		* @param {string} name The event name.
		* @returns {boolean} Whether the instance still exists and the action is allowed.
		*/
		#allowEvent(name) {
			if (!this.node || this.#lifecycleEvent) return false;
			this.#lifecycleEvent = true;
			try {
				return _fr0st_query.default.triggerOne(this.node, `${name}.ui.datetimepicker`) && Boolean(this.node);
			} finally {
				this.#lifecycleEvent = false;
			}
		}
		/**
		* Checks the format for date and time components.
		*/
		#checkFormat() {
			this.#hasYear = false;
			this.#hasMonth = false;
			this.#hasDate = false;
			this.#hasHours = false;
			this.#hasMinutes = false;
			const tokens = this.#format.matchAll(/([a-z])\1*|'[^']*'/gi);
			for (const token of tokens) {
				if (!token[1]) continue;
				switch (token[1]) {
					case "y":
					case "Y":
						this.#hasYear = true;
						break;
					case "M":
					case "L":
						this.#hasMonth = true;
						break;
					case "d":
					case "D":
						this.#hasDate = true;
						break;
					case "h":
					case "K":
						this.#useDayPeriod = true;
						this.#hasHours = true;
						break;
					case "H":
					case "k":
						this.#useDayPeriod = false;
						this.#hasHours = true;
						break;
					case "m": this.#hasMinutes = true;
				}
			}
			if (this.#hasDate && !this.#hasMonth) throw new Error("Date selector requires a month.");
			if (this.#hasMonth && !this.#hasYear) throw new Error("Month selector requires a year.");
			if (this.#hasMinutes && !this.#hasHours) throw new Error("Minute selector requires hours.");
			if (this.#hasHours && this.#hasYear && !this.#hasDate) throw new Error("Date/time selector requires a day of month.");
			if (this.#hasHours && this.options.multiDate) throw new Error("Time selector cannot be used with multiDate option.");
			this.#defaultView = this.options.defaultView;
			if (this.#hasDate) this.#minView = "days";
			else if (this.#hasMonth) this.#minView = "months";
			else if (this.#hasYear) this.#minView = "years";
			if (!this.#defaultView || this.#defaultView === "days" && !this.#hasDate || this.#defaultView === "months" && !this.#hasMonth || this.#defaultView === "years" && !this.#hasYear || ![
				"days",
				"months",
				"years"
			].includes(this.#defaultView)) this.#defaultView = this.#minView;
		}
		/**
		* Clamps a date between min and max dates.
		* @param {DateTime} date The input date.
		* @returns {DateTime} The clamped date.
		*/
		#clampDate(date) {
			if (!this.#isAfterMin(date)) date = this.#minDate;
			if (!this.#isBeforeMax(date)) date = this.#maxDate;
			return date;
		}
		/**
		* Clamps a date to the nearest stepping interval.
		* @param {DateTime} date The input date.
		* @returns {DateTime} The clamped date.
		*/
		#clampStepping(date) {
			if (!this.#hasMinutes || this.options.minuteStepping === 1) return date;
			const minutes = date.getMinutes();
			const stepMinutes = Math.min(_fr0st_query.default._toStep(minutes, this.options.minuteStepping), 60);
			if (minutes !== stepMinutes) return date.withMinutes(stepMinutes);
			return date;
		}
		/**
		* Gets the effective animation duration, respecting reduced motion.
		* @returns {number} The duration in milliseconds.
		*/
		#duration() {
			return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : this.options.duration;
		}
		/**
		* Attaches events for the DateTimePicker.
		*/
		#events() {
			this.listen(this.node, "change.ui.datetimepicker", (event) => {
				if (this.node && !event.skipUpdate) this.#readInput(true);
			});
			this.listen(this.node, "input.ui.datetimepicker", () => {
				if (this.node) this.#readInput(false);
			});
			if (this.#form) this.listen(this.#form, "reset.ui.datetimepicker", (event) => {
				if (!this.node) return;
				const timer = setTimeout(() => {
					this.#resetTimers.delete(timer);
					if (!this.node || event.defaultPrevented) return;
					this.#date = null;
					this.#dates = [];
					this.#readInput(true);
					this.#keepDate = false;
					this.hide();
				}, 0);
				this.#resetTimers.add(timer);
			});
			if (this.#hasYear) this.#eventsDate();
			if (this.#hasHours) this.#eventsTime();
			_fr0st_query.default.addEvent(this.#menuNode, "click.ui.datetimepicker", (event) => {
				event.stopPropagation();
			});
			this.#observer = new MutationObserver(() => {
				if (this.node) this.#refreshState();
			});
			this.#observer.observe(this.node, {
				attributes: true,
				attributeFilter: ["disabled", "readonly"]
			});
			for (const fieldset of _fr0st_query.default.parents(this.node, "fieldset")) this.#observer.observe(fieldset, {
				attributes: true,
				attributeFilter: ["disabled"]
			});
			if (this.options.inline) return;
			this.listen(this.node, "click.ui.datetimepicker", (event) => {
				if (!this.node) return;
				if (this.#useModal) event.stopPropagation();
				this.show();
			});
			if (!this.#useModal) {
				this.listen(this.node, "focus.ui.datetimepicker", () => {
					if (!this.node || !_fr0st_query.default.isSame(this.node, document.activeElement)) return;
					this.show();
				});
				_fr0st_query.default.addEvent(this.#menuNode, "keydown.ui.datetimepicker", (event) => {
					if (!this.node || event.code !== "Tab") return;
					const focusableNodes = _fr0st_query.default.find("[tabindex=\"0\"]", this.#menuNode);
					const focusIndex = _fr0st_query.default.indexOf(focusableNodes, event.target);
					if (event.shiftKey && focusIndex === 0) {
						event.preventDefault();
						_fr0st_query.default.focus(this.node);
					} else if (!event.shiftKey && focusIndex === focusableNodes.length - 1) {
						_fr0st_query.default.focus(this.node);
						this.hide();
					}
				});
			}
			this.listen(this.node, "keydown.ui.datetimepicker", (event) => {
				if (!this.node) return;
				switch (event.code) {
					case "Enter":
					case "NumpadEnter":
						event.preventDefault();
						this.toggle();
						break;
					case "Escape":
						if (_fr0st_query.default.isConnected(this.#menuNode)) {
							event.stopPropagation();
							this.hide();
						}
						break;
					case "Tab": if (event.shiftKey && !this.#useModal && _fr0st_query.default.isConnected(this.#menuNode)) this.hide();
					else if (!event.shiftKey && !this.#useModal && _fr0st_query.default.isConnected(this.#menuNode) && !_fr0st_query.default.getDataset(this.#menuNode, "uiAnimating")) {
						event.preventDefault();
						const focusNode = _fr0st_query.default.findOne("[tabindex=\"0\"]", this.#menuNode);
						_fr0st_query.default.focus(focusNode);
					}
				}
			});
		}
		/**
		* Attaches date events for the DateTimePicker.
		*/
		#eventsDate() {
			const updateValue = !this.#useModal;
			const focusTime = () => {
				let focusSelector;
				if (this.#hasHours) focusSelector = "[data-ui-action=\"changeView\"][data-ui-time-view=\"hours\"]";
				else if (this.#hasMinutes) focusSelector = "[data-ui-action=\"changeView\"][data-ui-time-view=\"minutes\"]";
				else if (this.#useDayPeriod) focusSelector = "[data-ui-action=\"togglePeriod\"]";
				if (focusSelector) {
					const focusNode = _fr0st_query.default.findOne(focusSelector, this.#timeContainer);
					_fr0st_query.default.focus(focusNode);
				}
			};
			const showTime = () => {
				this.#timeViewMode = null;
				this.#refreshTime();
				if (!this.node) return;
				this.#switchView(this.#timeContainer, this.#dateContainer, focusTime);
			};
			const handleAction = (event) => {
				if (!this.#isEditable()) return;
				event.preventDefault();
				const element = event.currentTarget;
				const action = _fr0st_query.default.getDataset(element, "uiAction");
				let tempDate = this.#date ? this.#date : this.#defaultDate;
				switch (action) {
					case "setDate":
						tempDate = tempDate.withYear(_fr0st_query.default.getDataset(element, "uiYear"), _fr0st_query.default.getDataset(element, "uiMonth"), _fr0st_query.default.getDataset(element, "uiDate"));
						if (this.options.multiDate) {
							let dates;
							let granularity;
							switch (this.#minView) {
								case "years":
									granularity = "year";
									break;
								case "months":
									granularity = "month";
									break;
								default: granularity = "day";
							}
							if (this.#isCurrent(tempDate, { granularity })) {
								const key = getDateKey(tempDate, this.#minView);
								dates = this.#dates.filter((date) => getDateKey(date, this.#minView) !== key);
							} else dates = this.#dates.concat([tempDate]);
							this.#viewDate = tempDate;
							this.#setDates(dates, { updateValue });
							if (!this.node) return;
						} else {
							tempDate = this.#clampDate(tempDate);
							if (this.#hasHours && !this.#isValid(tempDate)) {
								tempDate = this.#findValidTime(tempDate);
								if (!tempDate || !this.node) return;
							}
							this.#viewDate = tempDate;
							this.#setDate(tempDate, { updateValue });
							if (!this.node) return;
							if (this.#hasHours) {
								if (this.options.sideBySide) focusTime();
								else showTime();
							} else if (!this.options.keepOpen && !this.#useModal && !this.options.inline) {
								_fr0st_query.default.focus(this.node);
								this.hide();
							}
						}
						break;
					case "changeView":
						this.#viewMode = _fr0st_query.default.getDataset(element, "uiView");
						if (_fr0st_query.default.hasDataset(element, "uiYear")) this.#viewDate = this.#viewDate.withYear(_fr0st_query.default.getDataset(element, "uiYear"), _fr0st_query.default.getDataset(element, "uiMonth"), _fr0st_query.default.getDataset(element, "uiDate"));
						this.#refreshDate();
						if (!this.node) return;
						_fr0st_query.default.focus(this.#focusedDateItem);
						break;
					case "showTime":
						showTime();
						break;
					case "next":
					case "prev": {
						const direction = action === "prev" ? -1 : 1;
						const amount = (_fr0st_query.default.getDataset(element, "uiAmount") || 1) * direction;
						const unit = _fr0st_query.default.getDataset(element, "uiUnit");
						this.#viewDate = adjustDate(this.#viewDate, unit, amount);
						this.#refreshDate();
						if (!this.node) return;
						const focusAction = _fr0st_query.default.findOne(`[data-ui-action="${action}"]`, this.#dateContainer);
						_fr0st_query.default.focus(focusAction);
						break;
					}
					case "close":
						_fr0st_query.default.focus(this.node);
						this.hide();
				}
			};
			const refreshDate = () => {
				const year = this.#viewDate.getYear();
				const month = this.#viewDate.getMonth();
				const date = this.#viewDate.getDate();
				let focusSelector;
				switch (this.#viewMode) {
					case "days":
						focusSelector = `[data-ui-year="${year}"][data-ui-month="${month}"][data-ui-date="${date}"]`;
						break;
					case "months":
						focusSelector = `[data-ui-year="${year}"][data-ui-month="${month}"]`;
						break;
					case "years": focusSelector = `[data-ui-year="${year}"]`;
				}
				let focusNode = _fr0st_query.default.findOne(focusSelector, this.#dateContainer);
				if (!focusNode) {
					this.#refreshDate();
					if (!this.node) return;
					focusNode = _fr0st_query.default.findOne(focusSelector, this.#dateContainer);
				}
				this.#focusItem(focusNode);
				_fr0st_query.default.focus(focusNode);
			};
			_fr0st_query.default.addEventDelegate(this.#dateContainer, "click.ui.datetimepicker", "[data-ui-action]", (event) => {
				if (event.button) return;
				handleAction(event);
			});
			_fr0st_query.default.addEventDelegate(this.#dateContainer, "keydown.ui.datetimepicker", "[data-ui-action]", (event) => {
				switch (event.code) {
					case "Enter":
					case "NumpadEnter":
					case "Space":
						handleAction(event);
						return;
				}
			});
			_fr0st_query.default.addEventDelegate(this.#dateContainer, "mousedown.ui.datetimepicker", "[aria-disabled=\"false\"]", (event) => {
				const item = event.currentTarget;
				if (!this.#dateItems.includes(item) || _fr0st_query.default.isSame(item, this.#focusedDateItem)) return;
				const tempView = this.#viewDate.withYear(_fr0st_query.default.getDataset(item, "uiYear"), _fr0st_query.default.getDataset(item, "uiMonth"), _fr0st_query.default.getDataset(item, "uiDate"));
				if (tempView.isSame(this.#viewDate)) return;
				this.#viewDate = tempView;
				refreshDate();
			});
			_fr0st_query.default.addEvent(this.#dateContainer, "keydown.ui.datetimepicker", (event) => {
				if (!this.#isEditable()) return;
				const tempView = getKeyboardDate(this.#viewDate, this.#viewMode, event.code, event.ctrlKey);
				if (!tempView) return;
				event.preventDefault();
				if (tempView.isSame(this.#viewDate)) return;
				if (!this.#isBeforeMax(tempView, { allowSame: true }) || !this.#isAfterMin(tempView, { allowSame: true })) return;
				this.#viewDate = tempView;
				refreshDate();
			});
		}
		/**
		* Attaches events for the Modal.
		*/
		#eventsModal() {
			_fr0st_query.default.addEvent(this.#modal, "show.ui.modal", () => {
				if (!this.#allowEvent("show")) {
					if (this.node) _fr0st_query.default.detach(this.#modal);
					return false;
				}
				this.#originalDate = this.options.multiDate ? this.#dates.slice() : this.#date;
				this.#keepDate = false;
				this.#open = true;
				_fr0st_query.default.setAttribute(this.node, { "aria-expanded": true });
			});
			_fr0st_query.default.addEvent(this.#modal, "shown.ui.modal", () => {
				if (!this.node) return;
				_fr0st_query.default.triggerEvent(this.node, "shown.ui.datetimepicker");
			});
			_fr0st_query.default.addEvent(this.#modal, "hide.ui.modal", () => {
				if (!this.#allowEvent("hide")) {
					this.#keepDate = false;
					return false;
				}
				if (this.#keepDate) {
					if (this.options.multiDate) this.#setDates(this.#dates);
					else this.#setDate(this.#date);
				} else if (this.options.multiDate) this.#dates = this.#originalDate.slice();
				else this.#date = this.#originalDate;
				if (!this.node) return false;
				this.#open = false;
				_fr0st_query.default.setAttribute(this.node, { "aria-expanded": false });
			});
			_fr0st_query.default.addEvent(this.#modal, "hidden.ui.modal", () => {
				if (!this.node) return;
				this.#keepDate = false;
				this.#originalDate = null;
				_fr0st_query.default.detach(this.#modal);
				_fr0st_query.default.triggerEvent(this.node, "hidden.ui.datetimepicker");
			});
			_fr0st_query.default.addEvent(this.#setBtn, "click.ui.datetimepicker", () => {
				if (!this.node) return;
				this.#keepDate = true;
				this.hide();
			});
		}
		/**
		* Attaches time events for the DateTimePicker.
		*/
		#eventsTime() {
			const updateValue = !this.#useModal;
			const switchPeriod = (date) => {
				const currentHours = date.getHours();
				return date.withHours(currentHours + (currentHours < 12 ? 12 : -12));
			};
			const handleAction = (event) => {
				if (!this.#isEditable()) return;
				event.preventDefault();
				const element = event.currentTarget;
				const action = _fr0st_query.default.getDataset(element, "uiAction");
				let tempDate = this.#date ? this.#date : this.#defaultDate;
				let focusSelector;
				switch (action) {
					case "setHours":
						tempDate = tempDate.withHours(_fr0st_query.default.getDataset(element, "uiHour"));
						this.#timeViewMode = null;
						if (this.#hasMinutes) focusSelector = "[data-ui-action=\"changeView\"][data-ui-time-view=\"minutes\"]";
						else if (this.#useDayPeriod) focusSelector = "[data-ui-action=\"togglePeriod\"]";
						break;
					case "setMinutes":
						tempDate = tempDate.withMinutes(_fr0st_query.default.getDataset(element, "uiMinute"));
						this.#timeViewMode = null;
						if (this.#useDayPeriod) focusSelector = "[data-ui-action=\"togglePeriod\"]";
						break;
					case "togglePeriod":
						tempDate = switchPeriod(tempDate);
						focusSelector = "[data-ui-action=\"togglePeriod\"]";
						break;
					case "next":
					case "prev": {
						const unit = _fr0st_query.default.getDataset(element, "uiUnit");
						const stepping = unit === "minute" ? this.options.minuteStepping : 1;
						const amount = action === "prev" ? -stepping : stepping;
						tempDate = adjustDate(tempDate, unit, amount);
						focusSelector = `[data-ui-action="${action}"][data-ui-unit="${unit}"]`;
						break;
					}
					case "changeView":
						this.#timeViewMode = _fr0st_query.default.getDataset(element, "uiTimeView");
						this.#refreshTime();
						if (this.node) _fr0st_query.default.focus(this.#focusedTimeItem);
						return;
					case "showDate":
						this.#switchView(this.#dateContainer, this.#timeContainer, () => {
							_fr0st_query.default.focus(this.#focusedDateItem);
						});
						return;
					case "close":
						if (!this.#date && !this.#hasDate) {
							this.#setDate(this.#viewDate);
							if (!this.node) return;
						}
						_fr0st_query.default.focus(this.node);
						this.hide();
						return;
					default: return;
				}
				this.#setDate(tempDate, { updateValue });
				if (!this.node) return;
				if (focusSelector) {
					const focusNode = _fr0st_query.default.findOne(focusSelector, this.#timeContainer);
					_fr0st_query.default.focus(focusNode);
				}
			};
			_fr0st_query.default.addEventDelegate(this.#timeContainer, "click.ui.datetimepicker", "[data-ui-action]", (event) => {
				if (event.button) return;
				handleAction(event);
			});
			_fr0st_query.default.addEventDelegate(this.#timeContainer, "keydown.ui.datetimepicker", "[data-ui-action]", (event) => {
				if (!this.#isEditable()) return;
				switch (event.code) {
					case "Enter":
					case "NumpadEnter":
					case "Space":
						handleAction(event);
						return;
				}
				const action = _fr0st_query.default.getDataset(event.currentTarget, "uiAction");
				let tempDate = this.#date ? this.#date : this.#defaultDate;
				let focusSelector;
				switch (action) {
					case "setHours": break;
					case "togglePeriod":
						switch (event.code) {
							case "ArrowUp":
							case "ArrowDown":
								tempDate = switchPeriod(tempDate);
								focusSelector = `[data-ui-action="${action}"]`;
								break;
							default: return;
						}
						break;
					default: {
						let timeView;
						switch (action) {
							case "changeView":
								timeView = _fr0st_query.default.getDataset(event.currentTarget, "uiTimeView");
								break;
							case "prev":
							case "next":
								switch (_fr0st_query.default.getDataset(event.currentTarget, "uiUnit")) {
									case "hour":
										timeView = "hours";
										break;
									case "minute": timeView = "minutes";
								}
								break;
							default:
								if (this.#timeViewMode) return;
								timeView = "hours";
						}
						if (event.code !== "ArrowUp" && event.code !== "ArrowDown") return;
						const direction = event.code === "ArrowUp" ? 1 : -1;
						switch (timeView) {
							case "hours":
								tempDate = adjustDate(tempDate, "hour", direction);
								break;
							case "minutes": tempDate = adjustDate(tempDate, "minute", direction * this.options.minuteStepping);
						}
						focusSelector = `[data-ui-action="changeView"][data-ui-time-view="${timeView}"]`;
						break;
					}
				}
				const newDate = !this.#date || !tempDate.isSame(this.#date);
				if (newDate || focusSelector) event.preventDefault();
				if (newDate) {
					this.#setDate(tempDate, { updateValue });
					if (!this.node) return;
				}
				if (focusSelector) {
					const focusNode = _fr0st_query.default.findOne(focusSelector, this.#timeContainer);
					_fr0st_query.default.focus(focusNode);
				}
			});
			_fr0st_query.default.addEventDelegate(this.#timeContainer, "mousedown.ui.datetimepicker", "[aria-disabled=\"false\"]", (event) => {
				const focusNode = event.currentTarget;
				if (!this.#timeItems.includes(focusNode) || _fr0st_query.default.isSame(focusNode, this.#focusedTimeItem)) return;
				this.#focusItem(focusNode, { time: true });
				_fr0st_query.default.focus(focusNode);
			});
			_fr0st_query.default.addEvent(this.#timeContainer, "keydown.ui.datetimepicker", (event) => {
				if (!this.node) return;
				let focusNode;
				switch (this.#timeViewMode) {
					case "hours":
					case "minutes": {
						const nodes = this.#timeItems.filter((node) => _fr0st_query.default.getAttribute(node, "aria-disabled") === "false");
						const focusedIndex = Math.max(0, nodes.indexOf(this.#focusedTimeItem));
						switch (event.code) {
							case "ArrowUp":
								focusNode = nodes[focusedIndex - 4];
								break;
							case "ArrowRight":
								focusNode = nodes[focusedIndex + 1];
								break;
							case "ArrowDown":
								focusNode = nodes[focusedIndex + 4];
								break;
							case "ArrowLeft":
								focusNode = nodes[focusedIndex - 1];
								break;
							default: return;
						}
						break;
					}
					default: return;
				}
				event.preventDefault();
				if (!focusNode) return;
				this.#focusItem(focusNode, { time: true });
				_fr0st_query.default.focus(focusNode);
			});
		}
		/**
		* Finds the first selectable minute within a date.
		* @param {DateTime} date The candidate date.
		* @returns {DateTime|null} A valid time or null when no time is selectable.
		*/
		#findValidTime(date) {
			let current = date.startOfDay();
			const end = date.endOfDay();
			while (this.node && current.isBefore(end)) {
				if (current.getMinutes() % this.options.minuteStepping === 0 && this.#isValid(current)) return current;
				current = current.addMinute();
			}
			return null;
		}
		/**
		* Updates the focused grid item and its panel's tab stop.
		* @param {HTMLElement|null} item The focused item, or null to clear focus.
		* @param {object} [options] The focus options.
		* @param {boolean} [options.time=false] Whether the item belongs to the time panel.
		*/
		#focusItem(item, { time = false } = {}) {
			const items = time ? this.#timeItems : this.#dateItems;
			if (item !== null && !items.includes(item)) return;
			const focusedItem = time ? this.#focusedTimeItem : this.#focusedDateItem;
			_fr0st_query.default.setAttribute(focusedItem, { tabindex: -1 });
			if (time) this.#focusedTimeItem = item;
			else this.#focusedDateItem = item;
			_fr0st_query.default.setAttribute(item, { tabindex: 0 });
		}
		/**
		* Determines whether a date is after the minimum date.
		* @param {DateTime} date The date to test.
		* @param {object} [options] The options for how to compare the dates.
		* @param {string} [options.granularity] The level of granularity to use for comparison.
		* @param {boolean} [options.allowSame=false] Whether to also allow same check.
		* @returns {boolean} Whether the date is between min/max.
		*/
		#isAfterMin(date, { granularity = null, allowSame = false } = {}) {
			if (!this.#minDate) return true;
			switch (granularity) {
				case "day": return allowSame && isSameDay(date, this.#minDate) || isAfterDay(date, this.#minDate);
				case "month": return allowSame && isSameMonth(date, this.#minDate) || isAfterMonth(date, this.#minDate);
				case "year": return allowSame && isSameYear(date, this.#minDate) || isAfterYear(date, this.#minDate);
				default: return allowSame && isSameInstant(date, this.#minDate) || isAfterInstant(date, this.#minDate);
			}
		}
		/**
		* Determines whether a date is before the maximum date.
		* @param {DateTime} date The date to test.
		* @param {object} [options] The options for how to compare the dates.
		* @param {string} [options.granularity] The level of granularity to use for comparison.
		* @param {boolean} [options.allowSame=false] Whether to also allow same check.
		* @returns {boolean} Whether the date is between min/max.
		*/
		#isBeforeMax(date, { granularity = null, allowSame = false } = {}) {
			if (!this.#maxDate) return true;
			switch (granularity) {
				case "day": return allowSame && isSameDay(date, this.#maxDate) || isBeforeDay(date, this.#maxDate);
				case "month": return allowSame && isSameMonth(date, this.#maxDate) || isBeforeMonth(date, this.#maxDate);
				case "year": return allowSame && isSameYear(date, this.#maxDate) || isBeforeYear(date, this.#maxDate);
				default: return allowSame && isSameInstant(date, this.#maxDate) || isBeforeInstant(date, this.#maxDate);
			}
		}
		/**
		* Determines whether a date is a "current" date.
		* @param {DateTime} date The date to test.
		* @param {object} [options] The options for how to compare the dates.
		* @param {string} [options.granularity] The level of granularity to use for comparison.
		* @returns {boolean} Whether the date is a "current" date.
		*/
		#isCurrent(date, { granularity = null } = {}) {
			let callback;
			switch (granularity) {
				case "month":
					callback = isSameMonth;
					break;
				case "year":
					callback = isSameYear;
					break;
				default: callback = isSameDay;
			}
			if (this.options.multiDate) return this.#dates.some((currentDate) => callback(date, currentDate));
			return this.#date && callback(date, this.#date);
		}
		/**
		* Determines whether the input is editable.
		* @returns {boolean} Whether the input is editable.
		*/
		#isEditable() {
			return Boolean(this.node) && !_fr0st_query.default.is(this.node, ":disabled") && (this.options.ignoreReadonly || !_fr0st_query.default.is(this.node, ":read-only"));
		}
		/**
		* Determines whether a date is valid.
		* @param {DateTime} date The date to test.
		* @param {object} [options] The options for how to compare the dates.
		* @param {string} [options.granularity=second] The level of granularity to use for comparison.
		* @returns {boolean} Whether the date is valid.
		*/
		#isValid(date, { granularity = "second" } = {}) {
			if (!this.node || !date?.isValid || !Number.isFinite(date.getTimestamp())) return false;
			let minMaxGranularity;
			switch (granularity) {
				case "year":
				case "month":
				case "day": minMaxGranularity = granularity;
			}
			if (!this.#isAfterMin(date, {
				granularity: minMaxGranularity,
				allowSame: true
			})) return false;
			if (!this.#isBeforeMax(date, {
				granularity: minMaxGranularity,
				allowSame: true
			})) return false;
			if (this.options.isValidYear && !this.options.isValidYear(date) || !this.node) return false;
			if (granularity === "year") return true;
			if (this.options.isValidMonth && !this.options.isValidMonth(date) || !this.node) return false;
			if (granularity === "month") return true;
			if (this.options.isValidDay && !this.options.isValidDay(date) || !this.node) return false;
			if (granularity === "day" || !this.#hasHours) return true;
			if (this.options.isValidTime && !this.options.isValidTime(date) || !this.node) return false;
			return true;
		}
		/**
		* Creates a new DateTime object from format.
		* @param {string} date The date string.
		* @returns {DateTime|null} The new DateTime.
		*/
		#makeDate(date) {
			if (date === null) return date;
			date = `${date}`.trim();
			if (date === "") return null;
			const formats = [this.#format, ...this.options.altFormats];
			for (const format of formats) try {
				const newDate = _fr0st_datetime.default.fromFormat(format, date, this.#dateOptions);
				if (!newDate.isValid) continue;
				return this.#clampStepping(newDate);
			} catch {}
			return null;
		}
		/**
		* Filters, sorts, and deduplicates dates at the displayed calendar precision.
		* @param {(DateTime|null)[]} dates The input dates.
		* @returns {DateTime[]} The normalized dates.
		*/
		#normalizeDates(dates) {
			const unique = /* @__PURE__ */ new Map();
			for (const date of dates) {
				if (!this.node) break;
				if (date && this.#isValid(date)) unique.set(getDateKey(date, this.#minView), date);
			}
			return [...unique.values()].sort((a, b) => a.getTime() - b.getTime());
		}
		/**
		* Creates a new DateTime object set to the current date/time.
		* @returns {DateTime} The new DateTime.
		*/
		#now() {
			return this.#clampStepping(_fr0st_datetime.default.now(this.#dateOptions));
		}
		/**
		* Parses a date input. Strings use the configured format or altFormats.
		* @param {DateInput} date The date to parse.
		* @returns {DateTime|null} The parsed date, or null for missing or invalid input.
		*/
		#parseDate(date) {
			if (date === null || date === void 0 || date === "") return null;
			if (date instanceof _fr0st_datetime.default) return date.isValid && Number.isFinite(date.getTimestamp()) ? date.withLocale(this.#dateOptions.locale).withTimeZone(this.#dateOptions.timeZone) : null;
			if (typeof date === "string") return this.#makeDate(date);
			let parsed;
			try {
				if (date instanceof Date && Number.isFinite(date.getTime())) parsed = _fr0st_datetime.default.fromDate(date, this.#dateOptions);
				else if (typeof date === "number" && Number.isFinite(date)) parsed = _fr0st_datetime.default.fromTimestamp(date, this.#dateOptions);
				else if (Array.isArray(date) && date.length && date.length <= 7 && date.every((value) => Number.isFinite(value))) parsed = _fr0st_datetime.default.fromArray(date, this.#dateOptions);
			} catch {
				return null;
			}
			return parsed?.isValid && Number.isFinite(parsed.getTimestamp()) ? parsed : null;
		}
		/**
		* Parses DateTime objects from an array of values.
		* @param {DateInput[]|null} dates The dates to parse, or null to clear the selection.
		* @returns {DateTime[]} An array of parsed DateTime objects.
		* @throws {TypeError} When a non-array selection is supplied.
		*/
		#parseDates(dates) {
			if (dates === null || dates === void 0) return [];
			if (!Array.isArray(dates)) throw new TypeError("multiDate requires an array of dates or null.");
			return dates.map((date) => this.#parseDate(date)).filter((date) => Boolean(date));
		}
		/**
		* Synchronizes native input changes without emitting another change event.
		* @param {boolean} normalize Whether to normalize or restore invalid text.
		*/
		#readInput(normalize) {
			const options = this.options;
			const value = _fr0st_query.default.getValue(this.node);
			let valid;
			if (options.multiDate) {
				const parsed = value.split(options.multiDateSeparator).map((part) => this.#makeDate(part));
				const dates = this.#normalizeDates(parsed);
				valid = dates.length > 0;
				if (valid || !value || normalize && options.keepInvalid) this.#dates = dates;
			} else {
				const date = this.#makeDate(value);
				valid = date && this.#isValid(date);
				if (valid || !value || normalize && options.keepInvalid) this.#date = valid ? date : null;
			}
			if (!this.node) return;
			++this.#selectionId;
			if (normalize && (valid || !options.keepInvalid)) this.#updateValue();
			if (this.#useModal && this.#open) this.#originalDate = options.multiDate ? this.#dates.slice() : this.#date;
			this.#resetView();
			this.#refresh();
		}
		/**
		* Refreshes the date and time UI elements.
		* @param {boolean} [notify=true] Whether to emit refresh events.
		*/
		#refresh(notify = true) {
			if (!this.node || this.#refreshing) return;
			this.#refreshing = true;
			const selectionId = this.#selectionId;
			try {
				if (this.options.showToolbar) {
					if (this.#date) {
						if (this.#hasYear) _fr0st_query.default.setText(this.#toolbarYear, this.#date.format("yyyy"));
						if (this.#hasDate) _fr0st_query.default.setText(this.#toolbarDate, this.#date.format("LLL d"));
						else if (this.#hasMonth) _fr0st_query.default.setText(this.#toolbarDate, this.#date.format("LLL"));
						if (this.#hasHours) {
							const timeFormat = getDefaultTimeFormat(this.#dateOptions.locale, this.#useDayPeriod);
							_fr0st_query.default.setText(this.#toolbarTime, this.#date.format(timeFormat));
						}
					} else {
						if (this.#hasYear) _fr0st_query.default.setText(this.#toolbarYear, "-");
						if (this.#hasDate) _fr0st_query.default.setText(this.#toolbarDate, "- -");
						else if (this.#hasMonth) _fr0st_query.default.setText(this.#toolbarDate, "-");
						if (this.#hasHours) {
							const timeFormat = this.#useDayPeriod ? "-:- -" : "-:-";
							_fr0st_query.default.setText(this.#toolbarTime, timeFormat);
						}
					}
				}
				if (this.#hasYear && _fr0st_query.default.isConnected(this.#dateContainer)) {
					this.#refreshDate(notify);
					if (!this.node) return;
				}
				if (this.#hasHours && _fr0st_query.default.isConnected(this.#timeContainer)) {
					this.#refreshTime(notify);
					if (!this.node) return;
				}
				if (this.#hasYear && this.#hasHours && !this.options.sideBySide && this.#isEditable()) {
					const showDate = _fr0st_query.default.findOne("[data-ui-action=\"showDate\"]", this.#showDateTable);
					const showTime = _fr0st_query.default.findOne("[data-ui-action=\"showTime\"]", this.#showTimeTable);
					_fr0st_query.default.setAttribute(showDate, { tabindex: 0 });
					_fr0st_query.default.setAttribute(showTime, { tabindex: 0 });
				}
			} finally {
				this.#refreshing = false;
			}
			if (this.node && notify && selectionId !== this.#selectionId) this.#refresh(false);
		}
		/**
		* Synchronizes button semantics and roving focus after rendering.
		* @param {HTMLElement} container The rendered panel.
		*/
		#refreshAccessibility(container) {
			const editable = this.#isEditable();
			const time = _fr0st_query.default.isSame(container, this.#timeContainer);
			const items = time ? this.#timeItems : this.#dateItems;
			const focusedItem = time ? this.#focusedTimeItem : this.#focusedDateItem;
			const nodes = /* @__PURE__ */ new Set([...items, ..._fr0st_query.default.find("[data-ui-action], .datetimepicker-disabled", container)]);
			for (const node of nodes) {
				const item = items.includes(node);
				const disabled = !editable || _fr0st_query.default.hasClass(node, this.constructor.classes.disabled);
				const focusable = !disabled && (!item || _fr0st_query.default.isSame(node, focusedItem));
				_fr0st_query.default.setAttribute(node, {
					"role": "button",
					"aria-disabled": String(disabled),
					"tabindex": focusable ? 0 : -1
				});
				if (item) _fr0st_query.default.setAttribute(node, { "aria-pressed": String(_fr0st_query.default.hasClass(node, this.constructor.classes.active)) });
				if (disabled && editable && _fr0st_query.default.isSame(node, focusedItem)) this.#focusItem(null, { time });
			}
			const activeItem = time ? this.#focusedTimeItem : this.#focusedDateItem;
			if (editable && !activeItem) {
				const first = items.find((node) => _fr0st_query.default.getAttribute(node, "aria-disabled") === "false");
				this.#focusItem(first || null, { time });
			}
		}
		/**
		* Refreshes the date container.
		* @param {boolean} [notify=true] Whether to emit a refresh event.
		*/
		#refreshDate(notify = true) {
			if (!this.node) return;
			this.#dateItems = [];
			this.#focusedDateItem = null;
			_fr0st_query.default.empty(this.#dateContainer);
			switch (this.#viewMode) {
				case "years":
					this.#renderYears();
					break;
				case "months":
					this.#renderMonths();
					break;
				case "days": this.#renderDays();
			}
			if (!this.node) return;
			if (this.#hasHours && !this.options.sideBySide) {
				if (this.#useModal) _fr0st_query.default.prepend(this.#dateContainer, this.#showTimeTable);
				else _fr0st_query.default.append(this.#dateContainer, this.#showTimeTable);
			}
			if (this.options.showClose && !this.#useModal && !this.options.inline && !this.#hasHours) _fr0st_query.default.append(this.#dateContainer, this.#closeTable);
			if (!this.#isEditable()) {
				const focusableNodes = _fr0st_query.default.find("[tabindex]", this.#dateContainer);
				_fr0st_query.default.setAttribute(focusableNodes, { tabindex: -1 });
			}
			this.#refreshAccessibility(this.#dateContainer);
			this.update();
			if (notify) _fr0st_query.default.triggerEvent(this.node, "refresh.ui.datetimepicker", { detail: {
				view: "date",
				viewMode: this.#viewMode,
				viewDate: this.#viewDate
			} });
		}
		/**
		* Refreshes the toggle disabled.
		*/
		#refreshDisabled() {
			if (!this.node) return;
			if (!this.#isEditable()) _fr0st_query.default.addClass(this.#menuNode, this.constructor.classes.disabled);
			else _fr0st_query.default.removeClass(this.#menuNode, this.constructor.classes.disabled);
		}
		/**
		* Synchronizes editability without rebuilding panels or changing selection.
		*/
		#refreshState() {
			this.#refreshDisabled();
			for (const container of [this.#dateContainer, this.#timeContainer]) if (container) this.#refreshAccessibility(container);
			if (!this.options.inline && !this.#open) _fr0st_query.default.setAttribute(_fr0st_query.default.find("[tabindex]", this.#menuNode), { tabindex: -1 });
			const editable = this.#isEditable();
			_fr0st_query.default.setProperty(this.#setBtn, "disabled", !editable);
			if (!editable) this.hide();
		}
		/**
		* Refreshes the time container.
		* @param {boolean} [notify=true] Whether to emit a refresh event.
		*/
		#refreshTime(notify = true) {
			if (!this.node) return;
			this.#timeItems = [];
			this.#focusedTimeItem = null;
			_fr0st_query.default.empty(this.#timeContainer);
			if (this.#hasDate && !this.options.sideBySide) _fr0st_query.default.append(this.#timeContainer, this.#showDateTable);
			switch (this.#timeViewMode) {
				case "hours":
					this.#renderHours();
					break;
				case "minutes":
					this.#renderMinutes();
					break;
				default: this.#renderTime();
			}
			if (!this.node) return;
			if (this.options.showClose && !this.#useModal && !this.options.inline) _fr0st_query.default.append(this.#timeContainer, this.#closeTable);
			if (!this.#isEditable()) {
				const focusableNodes = _fr0st_query.default.find("[tabindex]", this.#timeContainer);
				_fr0st_query.default.setAttribute(focusableNodes, { tabindex: -1 });
			}
			this.#refreshAccessibility(this.#timeContainer);
			this.update();
			if (notify) _fr0st_query.default.triggerEvent(this.node, "refresh.ui.datetimepicker", { detail: {
				view: "time",
				viewMode: this.#timeViewMode,
				viewDate: this.#viewDate
			} });
		}
		/**
		* Renders the DateTimePicker.
		*/
		#render() {
			const menuId = (0, _fr0st_ui.generateId)("datetimepicker");
			this.#menuNode = _fr0st_query.default.create("div", {
				class: this.constructor.classes.menu,
				attributes: {
					"id": menuId,
					"role": this.options.inline ? "group" : "dialog",
					"aria-label": this.#hasHours ? this.constructor.lang.selectDateTime : this.constructor.lang.selectDate
				}
			});
			if (!this.options.inline) _fr0st_query.default.setAttribute(this.node, {
				"aria-controls": menuId,
				"aria-expanded": false,
				"aria-haspopup": "dialog"
			});
			const description = _fr0st_query.default.getAttribute(this.node, "aria-describedby");
			if (description) _fr0st_query.default.setAttribute(this.#menuNode, { "aria-describedby": description });
			if (this.options.showToolbar) this.#renderToolbar();
			this.#container = _fr0st_query.default.create("div", { class: this.constructor.classes.container });
			_fr0st_query.default.append(this.#menuNode, this.#container);
			if (this.#hasYear) {
				this.#dateContainer = _fr0st_query.default.create("div", { class: this.constructor.classes.column });
				if (!this.#hasHours || this.options.sideBySide) _fr0st_query.default.append(this.#container, this.#dateContainer);
			}
			if (this.#hasHours) {
				this.#timeContainer = _fr0st_query.default.create("div", { class: this.constructor.classes.column });
				if (!this.#hasDate || this.options.sideBySide) _fr0st_query.default.append(this.#container, this.#timeContainer);
			}
			if (this.#hasDate && this.#hasHours) {
				if (!this.options.sideBySide) {
					this.#showTimeTable = createTable(this.constructor.classes, this.constructor.icons, { body: (tbody) => {
						const tr = _fr0st_query.default.create("tr");
						_fr0st_query.default.append(tbody, tr);
						const td = _fr0st_query.default.create("td", {
							html: this.constructor.icons.time,
							class: [
								this.constructor.classes.action,
								this.constructor.classes.navigation,
								this.constructor.classes.spacingNav
							],
							attributes: {
								"colspan": 7,
								"role": "button",
								"tabindex": 0,
								"aria-label": this.constructor.lang.selectTime
							},
							dataset: { uiAction: "showTime" }
						});
						_fr0st_query.default.append(tr, td);
					} });
					this.#showDateTable = createTable(this.constructor.classes, this.constructor.icons, { body: (tbody) => {
						const row = _fr0st_query.default.create("tr");
						_fr0st_query.default.append(tbody, row);
						const td = _fr0st_query.default.create("td", {
							html: this.constructor.icons.date,
							class: [
								this.constructor.classes.action,
								this.constructor.classes.navigation,
								this.constructor.classes.spacingNav
							],
							attributes: {
								"colspan": 4,
								"role": "button",
								"tabindex": 0,
								"aria-label": this.constructor.lang.selectDate
							},
							dataset: { uiAction: "showDate" }
						});
						_fr0st_query.default.append(row, td);
					} });
				} else if (!this.options.vertical) {
					_fr0st_query.default.addClass(this.#menuNode, this.constructor.classes.menuWide);
					_fr0st_query.default.addClass(this.#container, this.constructor.classes.containerColumns);
				}
			}
			if (this.options.showClose && !this.#useModal && !this.options.inline) this.#closeTable = createTable(this.constructor.classes, this.constructor.icons, { body: (tbody) => {
				const row = _fr0st_query.default.create("tr");
				_fr0st_query.default.append(tbody, row);
				const td = _fr0st_query.default.create("td", {
					html: this.constructor.icons.close,
					class: [
						this.constructor.classes.action,
						this.constructor.classes.navigation,
						this.constructor.classes.spacingNav
					],
					attributes: {
						"colspan": 4,
						"role": "button",
						"tabindex": 0,
						"aria-label": this.constructor.lang.close
					},
					dataset: { uiAction: "close" }
				});
				_fr0st_query.default.append(row, td);
			} });
			if (this.#useModal) {
				_fr0st_query.default.addClass(this.#menuNode, "datetimepicker-modal");
				_fr0st_query.default.setAttribute(this.#menuNode, { role: "group" });
			} else if (this.options.inline) {
				_fr0st_query.default.addClass(this.#menuNode, this.constructor.classes.menuInline);
				_fr0st_query.default.after(this.node, this.#menuNode);
				this.#releaseDisplay = _fr0st_query.default.setStyleLock(this.node, "display", "none");
			} else _fr0st_query.default.addClass(this.#menuNode, this.constructor.classes.menuShadow);
		}
		/**
		* Renders the days picker.
		*/
		#renderDays() {
			const start = this.#viewDate.startOfMonth();
			const end = this.#viewDate.endOfMonth();
			let current = start.startOfWeek();
			const last = end.endOfWeek();
			let prev;
			let next;
			if (this.#isAfterMin(start)) prev = {
				dataset: {
					uiAction: "prev",
					uiUnit: "month"
				},
				attributes: { "aria-label": this.constructor.lang.prevMonth }
			};
			if (this.#isBeforeMax(end)) next = {
				dataset: {
					uiAction: "next",
					uiUnit: "month"
				},
				attributes: { "aria-label": this.constructor.lang.nextMonth }
			};
			const table = createTable(this.constructor.classes, this.constructor.icons, {
				header: {
					title: this.#viewDate.format("LLLL yyyy"),
					dataset: {
						uiAction: "changeView",
						uiView: "months"
					},
					attributes: {
						"aria-label": this.constructor.lang.selectMonth,
						"aria-live": "polite"
					},
					prev,
					next
				},
				head: (thead) => {
					const tr = _fr0st_query.default.create("tr");
					_fr0st_query.default.append(thead, tr);
					for (let i = 1; i <= 7; i++) {
						const currentDay = current.withWeekDay(i);
						const th = _fr0st_query.default.create("th", {
							class: this.constructor.classes.days,
							text: currentDay.dayName("short"),
							attributes: {
								scope: "col",
								abbr: currentDay.dayName("long")
							}
						});
						_fr0st_query.default.append(tr, th);
					}
				},
				body: (tbody) => {
					let tr;
					const now = this.#now();
					while (current.isSameOrBeforeDay(last)) {
						if (current.getWeekDay() === 1) {
							tr = _fr0st_query.default.create("tr");
							_fr0st_query.default.append(tbody, tr);
						}
						const td = _fr0st_query.default.create("td", {
							text: current.format("dd"),
							attributes: { role: "button" },
							dataset: {
								uiYear: current.getYear(),
								uiMonth: current.getMonth(),
								uiDate: current.getDate()
							}
						});
						if (this.options.ariaFormat) _fr0st_query.default.setAttribute(td, { "aria-label": current.format(this.options.ariaFormat) });
						_fr0st_query.default.append(tr, td);
						if (!this.#isValid(current, { granularity: "day" })) {
							if (!this.node) return;
							_fr0st_query.default.addClass(td, this.constructor.classes.disabled);
							_fr0st_query.default.setAttribute(td, { "aria-disabled": true });
						} else {
							_fr0st_query.default.addClass(td, this.constructor.classes.action);
							_fr0st_query.default.setDataset(td, { uiAction: "setDate" });
						}
						this.#dateItems.push(td);
						_fr0st_query.default.setAttribute(td, { tabindex: -1 });
						if (this.#viewDate.isSameDay(current)) this.#focusItem(td);
						if (this.#isCurrent(current, { granularity: "day" })) {
							_fr0st_query.default.addClass(td, this.constructor.classes.active);
							_fr0st_query.default.setAttribute(td, { "aria-pressed": true });
						} else if (!this.#viewDate.isSameMonth(current)) _fr0st_query.default.addClass(td, this.constructor.classes.tertiary);
						if (now.isSameDay(current)) _fr0st_query.default.addClass(td, this.constructor.classes.today);
						if (this.options.renderDay) {
							this.options.renderDay(current, td);
							if (!this.node) return;
						}
						current = current.addDay();
					}
				}
			});
			if (this.node) _fr0st_query.default.append(this.#dateContainer, table);
		}
		/**
		* Renders the hours picker.
		*/
		#renderHours() {
			const initialDate = this.#date ? this.#date : this.#defaultDate;
			let current = initialDate.withHours(0);
			const last = initialDate.endOfDay();
			const table = createTable(this.constructor.classes, this.constructor.icons, {
				borderless: true,
				body: (tbody) => {
					const row = createGrid(this.constructor.classes, tbody);
					while (current.isSameOrBeforeHour(last)) {
						const hourString = current.format("HH");
						const col = _fr0st_query.default.create("div", {
							text: hourString,
							class: this.constructor.classes.hourColumn,
							attributes: { "aria-label": hourString }
						});
						_fr0st_query.default.append(row, col);
						if (!this.#isValid(current, { granularity: "hour" })) {
							if (!this.node) return;
							_fr0st_query.default.addClass(col, this.constructor.classes.disabled);
						} else {
							_fr0st_query.default.addClass(col, this.constructor.classes.action);
							_fr0st_query.default.setDataset(col, {
								uiAction: "setHours",
								uiHour: current.getHours()
							});
							_fr0st_query.default.setAttribute(col, { role: "button" });
						}
						this.#timeItems.push(col);
						_fr0st_query.default.setAttribute(col, { tabindex: -1 });
						if (initialDate.isSameHour(current)) this.#focusItem(col, { time: true });
						if (this.#date && this.#date.isSameHour(current)) {
							_fr0st_query.default.addClass(col, this.constructor.classes.active);
							_fr0st_query.default.setAttribute(col, { "aria-pressed": true });
						}
						current = current.addHour();
					}
				}
			});
			if (this.node) _fr0st_query.default.append(this.#timeContainer, table);
		}
		/**
		* Renders the minutes picker.
		*/
		#renderMinutes() {
			const initialDate = this.#date ? this.#date : this.#defaultDate;
			let current = initialDate.withMinutes(0);
			const last = initialDate.endOfHour();
			const table = createTable(this.constructor.classes, this.constructor.icons, {
				borderless: true,
				body: (tbody) => {
					const row = createGrid(this.constructor.classes, tbody);
					const stepping = this.options.minuteStepping === 1 ? 5 : this.options.minuteStepping;
					while (current.isSameOrBeforeMinute(last)) {
						const minuteString = current.format("mm");
						const col = _fr0st_query.default.create("span", {
							text: minuteString,
							class: this.constructor.classes.timeColumn
						});
						_fr0st_query.default.append(row, col);
						if (!this.#isValid(current, { granularity: "minute" })) {
							if (!this.node) return;
							_fr0st_query.default.addClass(col, this.constructor.classes.disabled);
						} else {
							_fr0st_query.default.addClass(col, this.constructor.classes.action);
							_fr0st_query.default.setDataset(col, {
								uiAction: "setMinutes",
								uiMinute: current.getMinutes()
							});
							_fr0st_query.default.setAttribute(col, {
								"role": "button",
								"aria-label": minuteString
							});
						}
						this.#timeItems.push(col);
						_fr0st_query.default.setAttribute(col, { tabindex: -1 });
						if (initialDate.isSameMinute(current)) this.#focusItem(col, { time: true });
						if (this.#date && this.#date.isSameMinute(current)) {
							_fr0st_query.default.addClass(col, this.constructor.classes.active);
							_fr0st_query.default.setAttribute(col, { "aria-pressed": true });
						}
						current = current.addMinutes(stepping);
					}
				}
			});
			if (this.node) _fr0st_query.default.append(this.#timeContainer, table);
		}
		/**
		* Renders the Modal.
		*/
		#renderModal() {
			this.#modal = _fr0st_query.default.create("div", {
				class: this.constructor.classes.modal,
				attributes: {
					"tabindex": -1,
					"role": "dialog",
					"aria-modal": true
				}
			});
			const modalDialog = _fr0st_query.default.create("div", { class: this.constructor.classes.modalDialog });
			_fr0st_query.default.append(this.#modal, modalDialog);
			const modalContent = _fr0st_query.default.create("div", { class: this.constructor.classes.modalContent });
			_fr0st_query.default.append(modalDialog, modalContent);
			const modalHeader = _fr0st_query.default.create("div", { class: this.constructor.classes.modalHeader });
			_fr0st_query.default.append(modalContent, modalHeader);
			let titleText;
			if (!this.#hasHours) titleText = this.constructor.lang.selectDate;
			else if (!this.#hasDate) titleText = this.constructor.lang.selectTime;
			else titleText = this.constructor.lang.selectDateTime;
			const modalTitle = _fr0st_query.default.create("h6", {
				class: this.constructor.classes.modalTitle,
				text: titleText
			});
			const titleId = (0, _fr0st_ui.generateId)("datetimepicker-title");
			const modalId = (0, _fr0st_ui.generateId)("datetimepicker-modal");
			_fr0st_query.default.setAttribute(modalTitle, { id: titleId });
			_fr0st_query.default.setAttribute(this.#modal, {
				"id": modalId,
				"aria-labelledby": titleId
			});
			_fr0st_query.default.setAttribute(this.node, { "aria-controls": modalId });
			_fr0st_query.default.append(modalHeader, modalTitle);
			const modalBody = _fr0st_query.default.create("div", { class: this.constructor.classes.modalBody });
			_fr0st_query.default.append(modalContent, modalBody);
			_fr0st_query.default.append(modalBody, this.#menuNode);
			const modalFooter = _fr0st_query.default.create("div", { class: this.constructor.classes.modalFooter });
			_fr0st_query.default.append(modalContent, modalFooter);
			const cancelBtn = _fr0st_query.default.create("button", {
				class: this.constructor.classes.modalBtnSecondary,
				text: this.constructor.lang.cancel,
				attributes: {
					"type": "button",
					"data-ui-dismiss": "modal"
				}
			});
			_fr0st_query.default.append(modalFooter, cancelBtn);
			this.#setBtn = _fr0st_query.default.create("button", {
				class: this.constructor.classes.modalBtnPrimary,
				text: this.constructor.lang.set,
				attributes: { "type": "button" }
			});
			_fr0st_query.default.append(modalFooter, this.#setBtn);
		}
		/**
		* Renders the months picker.
		*/
		#renderMonths() {
			const start = this.#viewDate.startOfYear();
			const end = this.#viewDate.endOfYear();
			let current = start;
			let prev;
			let next;
			if (this.#isAfterMin(start)) prev = {
				dataset: {
					uiAction: "prev",
					uiUnit: "year"
				},
				attributes: { "aria-label": this.constructor.lang.prevYear }
			};
			if (this.#isBeforeMax(end)) next = {
				dataset: {
					uiAction: "next",
					uiUnit: "year"
				},
				attributes: { "aria-label": this.constructor.lang.nextYear }
			};
			const table = createTable(this.constructor.classes, this.constructor.icons, {
				header: {
					title: this.#viewDate.format("yyyy"),
					wide: true,
					dataset: {
						uiAction: "changeView",
						uiView: "years"
					},
					attributes: { "aria-label": this.constructor.lang.selectYear },
					prev,
					next
				},
				body: (tbody) => {
					const row = createGrid(this.constructor.classes, tbody);
					while (current.isSameOrBeforeMonth(end)) {
						const col = _fr0st_query.default.create("div", {
							text: current.format("LLL"),
							class: this.constructor.classes.dateColumn
						});
						_fr0st_query.default.append(row, col);
						this.#dateItems.push(col);
						_fr0st_query.default.setAttribute(col, { tabindex: -1 });
						if (this.#viewDate.isSameMonth(current)) this.#focusItem(col);
						if (this.#isCurrent(current, { granularity: "month" })) _fr0st_query.default.addClass(col, this.constructor.classes.active);
						if (!this.#isValid(current, { granularity: "month" })) {
							if (!this.node) return;
							_fr0st_query.default.addClass(col, this.constructor.classes.disabled);
						} else {
							_fr0st_query.default.addClass(col, this.constructor.classes.action);
							if (this.#minView === "months") _fr0st_query.default.setDataset(col, {
								uiAction: "setDate",
								uiYear: current.getYear(),
								uiMonth: current.getMonth()
							});
							else _fr0st_query.default.setDataset(col, {
								uiAction: "changeView",
								uiView: "days",
								uiYear: current.getYear(),
								uiMonth: current.getMonth()
							});
						}
						if (this.options.renderMonth) {
							this.options.renderMonth(current, col);
							if (!this.node) return;
						}
						current = current.addMonth();
					}
				}
			});
			if (this.node) _fr0st_query.default.append(this.#dateContainer, table);
		}
		/**
		* Renders the time picker.
		*/
		#renderTime() {
			const initialDate = this.#date ? this.#date : this.#defaultDate;
			const table = createTable(this.constructor.classes, this.constructor.icons, {
				borderless: true,
				body: (tbody) => {
					const separators = this.#hasHours + this.#hasMinutes - 1;
					const columns = this.#hasHours + this.#hasMinutes + this.#useDayPeriod;
					const separatorWidth = 3;
					const cellWidth = (100 - separators * separatorWidth) / columns;
					const upTr = _fr0st_query.default.create("tr");
					_fr0st_query.default.append(tbody, upTr);
					const timeTr = _fr0st_query.default.create("tr");
					_fr0st_query.default.append(tbody, timeTr);
					const downTr = _fr0st_query.default.create("tr");
					_fr0st_query.default.append(tbody, downTr);
					if (this.#hasHours) {
						let increment;
						let decrement;
						const nextHour = initialDate.addHour();
						if (this.#isValid(nextHour, { granularity: "hour" })) increment = {
							dataset: {
								uiAction: "next",
								uiUnit: "hour"
							},
							attributes: { "aria-label": this.constructor.lang.incrementHour }
						};
						const prevHour = initialDate.subHour();
						if (this.#isValid(prevHour, { granularity: "hour" })) decrement = {
							dataset: {
								uiAction: "prev",
								uiUnit: "hour"
							},
							attributes: { "aria-label": this.constructor.lang.decrementHour }
						};
						renderTimeColumn(this.constructor.classes, this.constructor.icons, {
							increment,
							select: {
								text: initialDate.format(this.#useDayPeriod ? "hh" : "HH"),
								dataset: {
									uiAction: "changeView",
									uiTimeView: "hours"
								},
								attributes: { "aria-label": this.constructor.lang.selectHour }
							},
							decrement,
							cellWidth,
							upTr,
							timeTr,
							downTr
						});
					}
					if (this.#hasHours && this.#hasMinutes) renderTimeSeparator(this.constructor.classes, {
						separatorWidth,
						upTr,
						timeTr,
						downTr
					});
					if (this.#hasMinutes) {
						let increment;
						let decrement;
						const nextMinute = this.#clampStepping(initialDate.addMinutes(this.options.minuteStepping));
						if (this.#isValid(nextMinute, { granularity: "minute" })) increment = {
							dataset: {
								uiAction: "next",
								uiUnit: "minute"
							},
							attributes: { "aria-label": this.constructor.lang.incrementMinute }
						};
						const prevMinute = initialDate.subMinutes(this.options.minuteStepping);
						if (this.#isValid(prevMinute, { granularity: "minute" })) decrement = {
							dataset: {
								uiAction: "prev",
								uiUnit: "minute"
							},
							attributes: { "aria-label": this.constructor.lang.decrementMinute }
						};
						renderTimeColumn(this.constructor.classes, this.constructor.icons, {
							increment,
							select: {
								text: initialDate.format("mm"),
								dataset: {
									uiAction: "changeView",
									uiTimeView: "minutes"
								},
								attributes: { "aria-label": this.constructor.lang.selectMinute }
							},
							decrement,
							cellWidth,
							upTr,
							timeTr,
							downTr
						});
					}
					if (this.#useDayPeriod) {
						const periodUpTd = _fr0st_query.default.create("td", { style: { width: `${cellWidth}%` } });
						_fr0st_query.default.append(upTr, periodUpTd);
						const periodTd = _fr0st_query.default.create("td");
						_fr0st_query.default.append(timeTr, periodTd);
						const periodButton = _fr0st_query.default.create("span", {
							text: initialDate.format("aa").toUpperCase(),
							class: this.constructor.classes.periodButton,
							attributes: {
								"role": "button",
								"tabindex": 0,
								"aria-label": this.constructor.lang.togglePeriod
							}
						});
						const currentHours = initialDate.getHours();
						const otherPeriod = initialDate.withHours(currentHours + (currentHours < 12 ? 12 : -12));
						if (!this.#isValid(otherPeriod)) {
							_fr0st_query.default.addClass(periodButton, this.constructor.classes.disabled);
							_fr0st_query.default.setAttribute(periodButton, { "aria-disabled": true });
						} else _fr0st_query.default.setDataset(periodButton, { uiAction: "togglePeriod" });
						_fr0st_query.default.append(periodTd, periodButton);
						const periodDownCell = _fr0st_query.default.create("td");
						_fr0st_query.default.append(downTr, periodDownCell);
					}
				}
			});
			if (this.node) _fr0st_query.default.append(this.#timeContainer, table);
		}
		/**
		* Renders the toolbar.
		*/
		#renderToolbar() {
			const toolbarRow = _fr0st_query.default.create("div", { class: this.constructor.classes.toolbarRow });
			if (!this.#useModal) _fr0st_query.default.addClass(toolbarRow, this.constructor.classes.toolbarPadding);
			_fr0st_query.default.append(this.#menuNode, toolbarRow);
			if (this.#hasYear) {
				const toolbarDateContainer = _fr0st_query.default.create("div");
				_fr0st_query.default.append(toolbarRow, toolbarDateContainer);
				this.#toolbarYear = _fr0st_query.default.create("div", { class: this.constructor.classes.toolbarYear });
				_fr0st_query.default.append(toolbarDateContainer, this.#toolbarYear);
				if (this.#hasMonth) {
					this.#toolbarDate = _fr0st_query.default.create("div", { class: this.constructor.classes.toolbarDate });
					_fr0st_query.default.append(toolbarDateContainer, this.#toolbarDate);
				}
			}
			if (this.#hasHours) {
				const toolbarTimeContainer = _fr0st_query.default.create("div");
				_fr0st_query.default.append(toolbarRow, toolbarTimeContainer);
				this.#toolbarTime = _fr0st_query.default.create("span", { class: this.constructor.classes.toolbarTime });
				_fr0st_query.default.append(toolbarTimeContainer, this.#toolbarTime);
			}
		}
		/**
		* Renders the years picker.
		*/
		#renderYears() {
			const viewYear = this.#viewDate.getYear();
			const startYear = viewYear - viewYear % 10;
			const endYear = startYear + 9;
			const start = this.#viewDate.withYear(startYear).startOfYear();
			const end = this.#viewDate.withYear(endYear).endOfYear();
			let current = start.subYear();
			const last = end.addYear();
			let prev;
			let next;
			if (this.#isAfterMin(start)) prev = {
				dataset: {
					uiAction: "prev",
					uiUnit: "year",
					uiAmount: 10
				},
				attributes: { "aria-label": this.constructor.lang.prevDecade }
			};
			if (this.#isBeforeMax(end)) next = {
				dataset: {
					uiAction: "next",
					uiUnit: "year",
					uiAmount: 10
				},
				attributes: { "aria-label": this.constructor.lang.nextDecade }
			};
			const table = createTable(this.constructor.classes, this.constructor.icons, {
				header: {
					title: `${start.format("yyyy")} - ${end.format("yyyy")}`,
					wide: true,
					prev,
					next
				},
				body: (tbody) => {
					const row = createGrid(this.constructor.classes, tbody);
					while (current.isSameOrBeforeYear(last)) {
						const currentYear = current.getYear();
						const yearString = current.format("yyyy");
						const col = _fr0st_query.default.create("div", {
							text: yearString,
							class: this.constructor.classes.dateColumn,
							attributes: { "aria-label": yearString }
						});
						_fr0st_query.default.append(row, col);
						this.#dateItems.push(col);
						_fr0st_query.default.setAttribute(col, { tabindex: -1 });
						if (this.#viewDate.isSameYear(current)) this.#focusItem(col);
						if (this.#isCurrent(current, { granularity: "year" })) _fr0st_query.default.addClass(col, this.constructor.classes.active);
						else if (currentYear < startYear || currentYear > endYear) _fr0st_query.default.addClass(col, this.constructor.classes.tertiary);
						if (!this.#isValid(current, { granularity: "year" })) {
							if (!this.node) return;
							_fr0st_query.default.addClass(col, this.constructor.classes.disabled);
						} else {
							_fr0st_query.default.addClass(col, this.constructor.classes.action);
							if (this.#minView === "years") _fr0st_query.default.setDataset(col, {
								uiAction: "setDate",
								uiYear: currentYear
							});
							else _fr0st_query.default.setDataset(col, {
								uiAction: "changeView",
								uiView: "months",
								uiYear: currentYear
							});
							_fr0st_query.default.setAttribute(col, { role: "button" });
						}
						if (this.options.renderYear) {
							this.options.renderYear(current, col);
							if (!this.node) return;
						}
						current = current.addYear();
					}
				}
			});
			if (this.node) _fr0st_query.default.append(this.#dateContainer, table);
		}
		/**
		* Resets the view.
		*/
		#resetView() {
			++this.#viewTransitionId;
			if (this.#dateContainer) _fr0st_query.default.stop(this.#dateContainer);
			if (this.#timeContainer) _fr0st_query.default.stop(this.#timeContainer);
			this.#viewMode = this.#minView;
			this.#timeViewMode = null;
			if (this.options.multiDate && this.#dates.length) this.#viewDate = this.#dates[0];
			else if (this.#date) this.#viewDate = this.#date;
			else {
				this.#viewDate = this.#defaultDate;
				this.#viewMode = this.#defaultView;
			}
			if (this.#hasDate && this.#hasHours && !this.options.sideBySide) {
				_fr0st_query.default.detach(this.#timeContainer);
				_fr0st_query.default.append(this.#container, this.#dateContainer);
			}
		}
		/**
		* Sets the current date.
		* @param {DateTime|null} [date] The input date.
		* @param {object} options The options for setting the date.
		* @param {boolean} [options.updateValue=true] Whether to update the value.
		*/
		#setDate(date, { updateValue = true } = {}) {
			if (!this.#isEditable()) return;
			date = date ? this.#clampStepping(date) : null;
			if (date && !this.#isValid(date)) date = null;
			if (!this.node) return;
			const oldDate = this.getDate();
			const oldValue = _fr0st_query.default.getValue(this.node);
			const id = ++this.#selectionId;
			this.#date = date;
			if (updateValue) {
				this.#updateValue();
				if (this.#useModal && this.#open) this.#originalDate = date;
			}
			this.#refresh();
			if (!this.node || id !== this.#selectionId || !updateValue || oldValue === _fr0st_query.default.getValue(this.node)) return;
			_fr0st_query.default.triggerEvent(this.node, "change.ui.datetimepicker", {
				data: { skipUpdate: true },
				detail: {
					old: oldDate,
					new: date
				}
			});
		}
		/**
		* Sets the current dates.
		* @param {DateTime[]} dates The input dates.
		* @param {object} options The options for setting the date.
		* @param {boolean} [options.updateValue=true] Whether to update the value.
		*/
		#setDates(dates, { updateValue = true } = {}) {
			if (!this.#isEditable()) return;
			dates = this.#normalizeDates(dates);
			if (!this.node) return;
			const oldDates = this.getDate();
			const oldValue = _fr0st_query.default.getValue(this.node);
			const id = ++this.#selectionId;
			this.#dates = dates;
			if (updateValue) {
				this.#updateValue();
				if (this.#useModal && this.#open) this.#originalDate = dates.slice();
			}
			this.#refresh();
			if (!this.node || id !== this.#selectionId || !updateValue || oldValue === _fr0st_query.default.getValue(this.node)) return;
			_fr0st_query.default.triggerEvent(this.node, "change.ui.datetimepicker", {
				data: { skipUpdate: true },
				detail: {
					old: oldDates,
					new: dates.slice()
				}
			});
		}
		/**
		* Switches panels and ignores completions from interrupted transitions.
		* @param {HTMLElement} target The panel to show.
		* @param {HTMLElement} source The panel to hide.
		* @param {Function} focus The focus restoration callback.
		*/
		#switchView(target, source, focus) {
			if (!this.node) return;
			const id = ++this.#viewTransitionId;
			_fr0st_query.default.stop(target);
			_fr0st_query.default.stop(source);
			_fr0st_query.default.append(this.#container, target);
			_fr0st_query.default.setStyle(target, { display: "" });
			Promise.all([_fr0st_query.default.squeezeIn(target, { duration: this.#duration() }), _fr0st_query.default.squeezeOut(source, { duration: this.#duration() })]).then(() => {
				if (!this.node || id !== this.#viewTransitionId) return;
				_fr0st_query.default.detach(source);
				this.update();
				focus();
			}).catch(() => {});
		}
		/**
		* Updates the input value to the current date.
		*/
		#updateValue() {
			let value;
			if (this.options.multiDate) value = this.#dates.map((date) => date.format(this.#format)).join(this.options.multiDateSeparator);
			else value = this.#date ? this.#date.format(this.#format) : "";
			_fr0st_query.default.setValue(this.node, value);
		}
	};

//#endregion
//#region src/js/index.js
	(0, _fr0st_ui.initComponent)("datetimepicker", DateTimePicker);
	_fr0st_query.default.addEvent(document, "mousedown.ui.datetimepicker", (event) => {
		const target = (0, _fr0st_ui.getClickTarget)(event);
		const nodes = _fr0st_query.default.find(".datetimepicker:not(.datetimepicker-inline):not(.datetimepicker-modal)");
		for (const node of nodes) {
			const input = _fr0st_query.default.getData(node, "input");
			const datetimepicker = _fr0st_query.default.getData(input, DateTimePicker.DATA_KEY);
			if (!datetimepicker) continue;
			if (_fr0st_query.default.isSame(datetimepicker.node, target) || _fr0st_query.default.isSame(node, target) || _fr0st_query.default.hasDescendent(node, target)) continue;
			datetimepicker.hide();
		}
	}, { capture: true });
	_fr0st_query.default.addEvent(document, "keydown.ui.datetimepicker", (event) => {
		if (event.code !== "Escape") return;
		let stopped = false;
		const nodes = _fr0st_query.default.find(".datetimepicker:not(.datetimepicker-inline):not(.datetimepicker-modal)");
		for (const [i, node] of nodes.entries()) {
			const input = _fr0st_query.default.getData(node, "input");
			const datetimepicker = _fr0st_query.default.getData(input, DateTimePicker.DATA_KEY);
			if (!datetimepicker) continue;
			if (!stopped) {
				stopped = true;
				event.stopPropagation();
			}
			if (i === 0) _fr0st_query.default.focus(input);
			datetimepicker.hide();
		}
	}, { capture: true });
	var js_default = DateTimePicker;

//#endregion
exports.DateTimePicker = js_default;
});
//# sourceMappingURL=frost-ui-datetimepicker.js.map