import DateTime from '@fr0st/datetime';
import $ from '@fr0st/query';
import { BaseComponent, Modal, Popper } from '@fr0st/ui';
import { isAfterDay, isAfterMonth, isAfterSecond, isAfterYear, isBeforeDay, isBeforeMonth, isBeforeSecond, isBeforeYear, isSameDay, isSameMonth, isSameSecond, isSameYear } from './comparisons.js';
import { checkDayPeriod, getDefaultDateFormat, getDefaultFormat, getDefaultTimeFormat } from './formats.js';

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
export default class DateTimePicker extends BaseComponent {
    /** @type {Record<string, string>} */
    static classes = {
        action: 'datetimepicker-action',
        active: 'datetimepicker-active',
        column: 'col d-flex flex-column',
        container: 'row row-cols-1 g-2',
        containerColumns: 'row-cols-lg-2',
        dateColumn: 'col-4 px-1 py-2',
        days: 'text-primary small fw-light',
        disabled: 'datetimepicker-disabled',
        hourColumn: 'col-3 p-1',
        menu: 'datetimepicker',
        menuInline: 'datetimepicker-inline',
        menuShadow: 'shadow-sm',
        menuWide: 'datetimepicker-wide',
        modal: 'modal',
        modalBody: 'modal-body',
        modalBtnPrimary: 'btn btn-primary ripple',
        modalBtnSecondary: 'btn btn-secondary ripple',
        modalContent: 'modal-content',
        modalDialog: 'modal-dialog modal-dialog-centered modal-sm',
        modalFooter: 'modal-footer',
        modalHeader: 'modal-header',
        modalTitle: 'modal-title',
        navigation: 'text-primary fs-5 lh-1',
        periodButton: 'btn btn-primary d-block',
        row: 'row g-0',
        rowContainer: 'p-0',
        spacingNav: 'py-2',
        spacingSeparator: 'py-2',
        spacingTime: 'py-2 px-0',
        spacingTimeNav: 'py-4 px-0',
        table: 'table table-borderless table-sm text-center mx-0 my-auto',
        tertiary: 'text-body-tertiary',
        time: 'datetimepicker-time',
        timeColumn: 'col-3 px-1 py-2',
        title: 'fw-bold',
        titleWide: 'w-100',
        today: 'datetimepicker-today',
        toolbarDate: 'fs-3 mb-0',
        toolbarRow: 'd-flex align-items-end justify-content-between',
        toolbarPadding: 'p-3',
        toolbarTime: 'fs-3 mb-0',
        toolbarYear: 'small text-body-secondary mb-0',
    };
    /** @type {DateTimePickerOptions} */
    static defaults = {
        format: null,
        altFormats: [],
        ariaFormat: 'LLLL d, yyyy',
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
        multiDateSeparator: ',',
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
        placement: 'bottom',
        position: 'start',
        fixed: false,
        spacing: 0,
        minContact: false,
    };
    /** @type {Record<string, string>} */
    static icons = {
        close: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" viewBox="0 0 24 24"><title>check</title><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor" /></svg>',
        date: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1" fill="currentColor"/></svg>',
        down: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42z" fill="currentColor"/></svg>',
        left: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6l1.41-1.42z" fill="currentColor"/></svg>',
        right: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6l-1.41-1.42z" fill="currentColor"/></svg>',
        time: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5z" fill="currentColor"/></svg>',
        up: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6l1.41 1.41z" fill="currentColor"/></svg>',
    };
    /** @type {Record<string, string>} */
    static lang = {
        cancel: 'Cancel',
        close: 'Close',
        decrementHour: 'Decrement Hour',
        decrementMinute: 'Decrement Minute',
        incrementHour: 'Increment Hour',
        incrementMinute: 'Increment Minute',
        nextDecade: 'Next Decade',
        nextMonth: 'Next Month',
        nextYear: 'Next Year',
        prevDecade: 'Previous Decade',
        prevMonth: 'Previous Month',
        prevYear: 'Previous Year',
        selectDate: 'Select Date',
        selectDateTime: 'Select Date & Time',
        selectHour: 'Select Hour',
        selectMinute: 'Select Minute',
        selectMonth: 'Select Month',
        selectTime: 'Select Time',
        selectYear: 'Select Year',
        set: 'Set',
        togglePeriod: 'Toggle Period',
    };

    #activeTarget;
    #closeTable;
    #container;
    #date = null;
    #dateContainer;
    #dateOptions;
    #dates = [];
    #defaultDate;
    #defaultView;
    #format;
    #hasDate;
    #hasHours;
    #hasMinutes;
    #hasMonth;
    #hasYear;
    #keepDate;
    #maxDate = null;
    #menuNode;
    #minDate = null;
    #minView;
    #modal;
    #popper;
    #setBtn;
    #showDateTable;
    #showTimeTable;
    #timeContainer;
    #timeViewMode;
    #toolbarDate;
    #toolbarTime;
    #toolbarYear;
    #useDayPeriod;
    #useModal;
    #viewDate;
    #viewMode;

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
     * New DateTimePicker constructor.
     * @param {HTMLElement} node The input node.
     * @param {DateTimePickerOptions} [options] The component options.
     */
    constructor(node, options) {
        super(node, options);

        this.#dateOptions = {
            locale: this.options.locale || DateTime.getDefaultLocale(),
            timeZone: this.options.timeZone || DateTime.getDefaultTimeZone(),
        };

        if (!Number.isInteger(this.options.minuteStepping) ||
            this.options.minuteStepping < 1 || this.options.minuteStepping > 60) {
            super.dispose();
            throw new RangeError('minuteStepping must be an integer between 1 and 60.');
        }

        try {
            this.#useDayPeriod = checkDayPeriod(this.#dateOptions.locale);
            this.#format = this.options.format || (this.options.multiDate ?
                getDefaultDateFormat(this.#dateOptions.locale) :
                getDefaultFormat(this.#dateOptions.locale, this.#useDayPeriod));
            this.#useModal = !this.options.inline && (this.options.modal ||
                (this.options.mobileModal && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)));

            this.#checkFormat();
            this.#minDate = this.#parseDate(this.options.minDate);
            this.#maxDate = this.#parseDate(this.options.maxDate);
        } catch (error) {
            super.dispose();
            throw error;
        }

        const value = $.getValue(this.node);

        if (this.options.multiDate) {
            this.#dates = [...new Set(value.split(this.options.multiDateSeparator))]
                .map((val) => this.#makeDate(val))
                .filter((date) => date && this.#isValid(date));
        } else {
            this.#date = this.#makeDate(value);

            if (!this.#date && this.options.useCurrent) {
                this.#date = this.#now();
            }

            if (this.#date && !this.#isValid(this.#date)) {
                this.#date = null;
            }
        }

        this.#defaultDate = this.#parseDate(this.options.defaultDate);

        if (!this.#defaultDate) {
            this.#defaultDate = this.#now();
        }

        if (this.#hasHours && !this.#isValid(this.#defaultDate)) {
            let current = this.#defaultDate.startOfDay();
            const endOfDay = this.#defaultDate.endOfDay();

            while (current.isBefore(endOfDay)) {
                if (this.#isValid(current)) {
                    this.#defaultDate = current;
                    break;
                }

                current = current.addMinutes(5);
            }
        }

        if (
            this.#date ||
            (this.options.multiDate && this.#dates.length) ||
            (value && !this.options.keepInvalid)
        ) {
            this.#updateValue();
        }

        this.#render();
        this.#events();
        this.#resetView();

        if (this.#useModal) {
            this.#renderModal();
            this.#eventsModal();
        } else if (this.options.inline) {
            this.#refresh();
        }

        this.#refreshDisabled();

        $.setData(this.#menuNode, { input: this.node });
    }

    /**
     * Clear the current value.
     */
    clear() {
        this.setDate(null);
    }

    /**
     * Disable the DateTimePicker.
     */
    disable() {
        $.setAttribute(this.node, { disabled: true });
        this.#refreshDisabled();
        this.#refresh();
    }

    /**
     * Dispose the DateTimePicker.
     */
    dispose() {
        if (this.#popper) {
            this.#popper.dispose();
            this.#popper = null;
        }

        if (this.#modal) {
            Modal.init(this.#modal).dispose();
            this.#modal = null;
            this.#setBtn = null;
            this.#toolbarYear = null;
            this.#toolbarDate = null;
            this.#toolbarTime = null;
        }

        $.removeEvent(this.node, 'change.ui.datetimepicker');
        $.removeEvent(this.node, 'input.ui.datetimepicker');
        $.removeEvent(this.node, 'click.ui.datetimepicker');
        $.removeEvent(this.node, 'focus.ui.datetimepicker');
        $.removeEvent(this.node, 'keydown.ui.datetimepicker');
        $.removeEvent(this.node, 'keyup.ui.datetimepicker');

        $.remove(this.#menuNode);

        this.#date = null;
        this.#dates = null;
        this.#minDate = null;
        this.#maxDate = null;
        this.#viewDate = null;
        this.#defaultDate = null;
        this.#dateOptions = null;
        this.#menuNode = null;
        this.#container = null;
        this.#dateContainer = null;
        this.#timeContainer = null;
        this.#showTimeTable = null;
        this.#showDateTable = null;
        this.#closeTable = null;

        super.dispose();
    }

    /**
     * Enable the DateTimePicker.
     */
    enable() {
        $.removeAttribute(this.node, 'disabled');
        this.#refreshDisabled();
        this.#refresh();
    }

    /**
     * Get the current date(s).
     * @returns {DateTime|null|DateTime[]} The current date(s).
     */
    getDate() {
        if (this.options.multiDate) {
            return this.#dates.slice();
        }

        return this.#date;
    }

    /**
     * Get the maximum date.
     * @returns {DateTime|null} The maximum date.
     */
    getMaxDate() {
        if (!this.#maxDate) {
            return null;
        }

        return this.#maxDate;
    }

    /**
     * Get the minimum date.
     * @returns {DateTime|null} The minimum date.
     */
    getMinDate() {
        if (!this.#minDate) {
            return null;
        }

        return this.#minDate;
    }

    /**
     * Get the view date.
     * @returns {DateTime} The view date.
     */
    getViewDate() {
        return this.#viewDate;
    }

    /**
     * Hide the DateTimePicker.
     */
    hide() {
        if (this.options.inline) {
            return;
        }

        if (this.#useModal) {
            Modal.init(this.#modal).hide();
            return;
        }

        if (
            !$.isConnected(this.#menuNode) ||
            $.getDataset(this.#menuNode, 'uiAnimating') ||
            !$.triggerOne(this.node, 'hide.ui.datetimepicker')
        ) {
            return;
        }

        $.setDataset(this.#menuNode, { uiAnimating: 'out' });

        const focusableNodes = $.find('[tabindex]', this.#menuNode);
        $.setAttribute(focusableNodes, { tabindex: -1 });

        $.fadeOut(this.#menuNode, {
            duration: this.options.duration,
        }).then((_) => {
            this.#popper.dispose();
            this.#popper = null;

            $.detach(this.#menuNode);
            $.removeDataset(this.#menuNode, 'uiAnimating');
            $.triggerEvent(this.node, 'hidden.ui.datetimepicker');
        }).catch((_) => {
            if ($.getDataset(this.#menuNode, 'uiAnimating') === 'out') {
                $.removeDataset(this.#menuNode, 'uiAnimating');
            }
        });
    }

    /**
     * Refresh the DateTimePicker.
     */
    refresh() {
        if (this.options.multiDate) {
            this.#setDates(this.#dates);
        } else {
            this.#setDate(this.#date);
        }
    }

    /**
     * Set the current date(s).
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
     * Set the maximum date.
     * @param {DateInput} maxDate The input date(s).
     */
    setMaxDate(maxDate) {
        this.#maxDate = this.#parseDate(maxDate);

        this.refresh();
    }

    /**
     * Set the minimum date.
     * @param {DateInput} minDate The input date(s).
     */
    setMinDate(minDate) {
        this.#minDate = this.#parseDate(minDate);

        this.refresh();
    }

    /**
     * Show the DateTimePicker.
     */
    show() {
        if (
            this.options.inline ||
            $.isConnected(this.#menuNode) ||
            !this.#isEditable()
        ) {
            return;
        }

        if (this.#useModal) {
            if (this.options.appendTo) {
                $.append(this.options.appendTo, this.#modal);
            } else {
                const parentModal = $.closest(this.node, '.modal').shift();

                if (parentModal) {
                    $.after(parentModal, this.#modal);
                } else {
                    $.after(this.node, this.#modal);
                }
            }

            this.#resetView();
            this.#refresh();

            const modal = Modal.init(this.#modal);

            modal.show(this.#activeTarget);
            return;
        }

        if (
            $.getDataset(this.#menuNode, 'uiAnimating') ||
            !$.triggerOne(this.node, 'show.ui.datetimepicker')
        ) {
            return;
        }

        $.setDataset(this.#menuNode, { uiAnimating: 'in' });

        if (this.options.appendTo) {
            $.append(this.options.appendTo, this.#menuNode);
        } else {
            $.after(this.node, this.#menuNode);
        }

        this.#resetView();
        this.#refresh();

        this.#popper = new Popper(
            this.#menuNode,
            {
                reference: this.node,
                placement: this.options.placement,
                position: this.options.position,
                fixed: this.options.fixed,
                spacing: this.options.spacing,
                minContact: this.options.minContact,
            },
        );

        $.fadeIn(this.#menuNode, {
            duration: this.options.duration,
        }).then((_) => {
            $.removeDataset(this.#menuNode, 'uiAnimating');
            $.triggerEvent(this.node, 'shown.ui.datetimepicker');
        }).catch((_) => {
            if ($.getDataset(this.#menuNode, 'uiAnimating') === 'in') {
                $.removeDataset(this.#menuNode, 'uiAnimating');
            }
        });
    }

    /**
     * Toggle the DateTimePicker.
     */
    toggle() {
        if ($.isConnected(this.#menuNode)) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Update the DateTimePicker position.
     */
    update() {
        if (this.#popper) {
            this.#popper.update();
        }
    }

    /**
     * Check the format for date and time components.
     */
    #checkFormat() {
        this.#hasYear = false;
        this.#hasMonth = false;
        this.#hasDate = false;
        this.#hasHours = false;
        this.#hasMinutes = false;

        const tokens = this.#format.matchAll(/([a-z])\1*|'[^']*'/ig);
        for (const token of tokens) {
            if (!token[1]) {
                continue;
            }

            switch (token[1]) {
                case 'y':
                case 'Y':
                    this.#hasYear = true;
                    break;
                case 'M':
                case 'L':
                    this.#hasMonth = true;
                    break;
                case 'd':
                case 'D':
                    this.#hasDate = true;
                    break;
                case 'h':
                case 'K':
                    this.#useDayPeriod = true;
                    this.#hasHours = true;
                    break;
                case 'H':
                case 'k':
                    this.#useDayPeriod = false;
                    this.#hasHours = true;
                    break;
                case 'm':
                    this.#hasMinutes = true;
                    break;
            }
        }

        if (this.#hasDate && !this.#hasMonth) {
            throw new Error('Date selector requires a month.');
        }

        if (this.#hasMonth && !this.#hasYear) {
            throw new Error('Month selector requires a year.');
        }

        if (this.#hasMinutes && !this.#hasHours) {
            throw new Error('Minute selector requires hours.');
        }

        if (this.#hasHours && this.#hasYear && !this.#hasDate) {
            throw new Error('Date/time selector requires a day of month.');
        }

        if (this.#hasHours && this.options.multiDate) {
            throw new Error('Time selector cannot be used with multiDate option.');
        }

        this.#defaultView = this.options.defaultView;

        if (this.#hasDate) {
            this.#minView = 'days';
        } else if (this.#hasMonth) {
            this.#minView = 'months';
        } else if (this.#hasYear) {
            this.#minView = 'years';
        }

        if (
            !this.#defaultView ||
            (this.#defaultView === 'days' && !this.#hasDate) ||
            (this.#defaultView === 'months' && !this.#hasMonth) ||
            (this.#defaultView === 'years' && !this.#hasYear) ||
            !['days', 'months', 'years'].includes(this.#defaultView)
        ) {
            this.#defaultView = this.#minView;
        }
    }

    /**
     * Clamp a date between min and max dates.
     * @param {DateTime} date The input date.
     * @returns {DateTime} The clamped date.
     */
    #clampDate(date) {
        if (!this.#isAfterMin(date)) {
            date = date.withTimestamp(this.#minDate.getTimestamp());
        }

        if (!this.#isBeforeMax(date)) {
            date = date.withTimestamp(this.#maxDate.getTimestamp());
        }

        return date;
    }

    /**
     * Clamp a date to the nearest stepping interval.
     * @param {DateTime} date The input date.
     * @returns {DateTime} The clamped date.
     */
    #clampStepping(date) {
        if (!this.#hasMinutes || this.options.minuteStepping == 1) {
            return date;
        }

        const minutes = date.getMinutes();
        const stepMinutes = Math.min(
            $._toStep(minutes, this.options.minuteStepping),
            60,
        );

        if (minutes !== stepMinutes) {
            return date.withMinutes(stepMinutes);
        }

        return date;
    }

    /**
     * Create a table.
     * @param {object} options Options for rendering the table.
     * @returns {HTMLElement} The new table.
     */
    #createTable(options) {
        const table = $.create('table', {
            class: this.constructor.classes.table,
        });

        if (options.header) {
            const thead = $.create('thead');
            $.append(table, thead);

            const tr = $.create('tr');
            $.append(thead, tr);

            const prevTd = $.create('th', {
                html: this.constructor.icons.left,
                class: this.constructor.classes.navigation,
            });

            if (!options.header.prev) {
                $.addClass(prevTd, this.constructor.classes.disabled);
            } else {
                $.addClass(prevTd, this.constructor.classes.action);
                $.setDataset(prevTd, options.header.prev.dataset);
                $.setAttribute(prevTd, {
                    role: 'button',
                    tabindex: 0,
                    ...options.header.prev.attributes,
                });
            }

            $.append(tr, prevTd);

            const titleTd = $.create('th', {
                class: this.constructor.classes.title,
                text: options.header.title,
                attributes: {
                    colspan: 5,
                    ...options.header.attributes,
                },
            });

            if (options.header.dataset) {
                $.addClass(titleTd, this.constructor.classes.action);
                $.setDataset(titleTd, options.header.dataset);
                $.setAttribute(titleTd, {
                    role: 'button',
                    tabindex: 0,
                });
            }

            if (options.header.wide) {
                $.addClass(titleTd, this.constructor.classes.titleWide);
            }

            $.append(tr, titleTd);

            const nextTd = $.create('th', {
                html: this.constructor.icons.right,
                class: this.constructor.classes.navigation,
            });

            if (!options.header.next) {
                $.addClass(nextTd, this.constructor.classes.disabled);
            } else {
                $.addClass(nextTd, this.constructor.classes.action);
                $.setDataset(nextTd, options.header.next.dataset);
                $.setAttribute(nextTd, {
                    role: 'button',
                    tabindex: 0,
                    ...options.header.next.attributes,
                });
            }

            $.append(tr, nextTd);

            if (options.head) {
                options.head(thead);
            }
        }

        const tbody = $.create('tbody');
        $.append(table, tbody);

        options.body(tbody);

        return table;
    }

    /**
     * Attach events for the DateTimePicker.
     */
    #events() {
        $.addEvent(this.node, 'change.ui.datetimepicker', (e) => {
            if (e.skipUpdate) {
                return;
            }

            const value = $.getValue(this.node);
            if (this.options.multiDate) {
                const dates = value.split(this.options.multiDateSeparator);

                const validDates = [...new Set(dates)]
                    .map((val) => this.#makeDate(val))
                    .filter((date) => date && this.#isValid(date));

                if (validDates.length === dates.length) {
                    this.#setDates(validDates);
                } else if (!this.options.keepInvalid && value) {
                    if (validDates.length) {
                        this.#setDates(validDates);
                    } else {
                        this.#setDates(this.#dates);
                    }
                } else {
                    this.#dates = validDates;
                    this.#refresh();
                }
            } else {
                const date = this.#makeDate(value);

                if (date && this.#isValid(date)) {
                    this.#setDate(date);
                } else if (!this.options.keepInvalid && value) {
                    this.#setDate(this.#date);
                } else {
                    this.#date = null;
                    this.#refresh();
                }
            }
        });

        if (this.#hasYear) {
            this.#eventsDate();
        }

        if (this.#hasHours) {
            this.#eventsTime();
        }

        $.addEvent(this.#menuNode, 'click.ui.datetimepicker', (e) => {
            // prevent menu node from closing modal
            e.stopPropagation();
        });

        if (this.options.inline) {
            return;
        }

        $.addEvent(this.node, 'input.ui.datetimepicker', (_) => {
            const value = $.getValue(this.node);
            if (this.options.multiDate) {
                const dates = value.split(this.options.multiDateSeparator);

                const validDates = [...new Set(dates)]
                    .map((val) => this.#makeDate(val))
                    .filter((date) => date && this.#isValid(date));

                if (validDates.length) {
                    this.#dates = validDates;
                    this.#refresh();
                }
            } else {
                const date = this.#makeDate(value);

                if (date && this.#isValid(date)) {
                    this.#date = date;
                    this.#refresh();
                }
            }
        });

        $.addEvent(this.node, 'click.ui.datetimepicker', (_) => {
            if ($.getDataset(this.#menuNode, 'uiAnimating') === 'in') {
                return;
            }

            if (!this.#useModal) {
                $.stop(this.#menuNode);
                $.removeDataset(this.#menuNode, 'uiAnimating');
            } else {
                this.#activeTarget = this.node;
            }

            this.show();
        });

        if (!this.#useModal) {
            $.addEvent(this.node, 'focus.ui.datetimepicker', (_) => {
                if (!$.isSame(this.node, document.activeElement)) {
                    return;
                }

                $.stop(this.#menuNode);
                $.removeDataset(this.#menuNode, 'uiAnimating');

                this.show();
            });

            $.addEvent(this.#menuNode, 'keydown.ui.datetimepicker', (e) => {
                if (e.code !== 'Tab') {
                    return;
                }

                const focusableNodes = $.find('[tabindex="0"]', this.#menuNode);
                const focusIndex = $.indexOf(focusableNodes, e.target);

                if (e.shiftKey && focusIndex === 0) {
                    e.preventDefault();

                    $.focus(this.node);
                } else if (!e.shiftKey && focusIndex === focusableNodes.length - 1) {
                    $.focus(this.node);

                    this.hide();
                }
            });
        }

        $.addEvent(this.node, 'keydown.ui.datetimepicker', (e) => {
            switch (e.code) {
                case 'Enter':
                case 'NumpadEnter':
                    e.preventDefault();

                    this.toggle();
                    break;
                case 'Escape':
                    if ($.isConnected(this.#menuNode)) {
                        // prevent node from closing modal
                        e.stopPropagation();

                        this.hide();
                    }
                    break;
                case 'Tab':
                    if (
                        e.shiftKey &&
                        !this.#useModal &&
                        $.isConnected(this.#menuNode)
                    ) {
                        this.hide();
                    } else if (
                        !e.shiftKey &&
                        !this.#useModal &&
                        $.isConnected(this.#menuNode) &&
                        !$.getDataset(this.#menuNode, 'uiAnimating')
                    ) {
                        e.preventDefault();

                        const focusNode = $.findOne('[tabindex="0"]', this.#menuNode);
                        $.focus(focusNode);
                    }
                    break;
            }
        });
    }

    /**
     * Attach date events for the DateTimePicker.
     */
    #eventsDate() {
        const updateValue = !this.#useModal;

        const focusTime = (_) => {
            let focusSelector;
            if (this.#hasHours) {
                focusSelector = '[data-ui-action="changeView"][data-ui-time-view="hours"]';
            } else if (this.#hasMinutes) {
                focusSelector = '[data-ui-action="changeView"][data-ui-time-view="minutes"]';
            } else if (this.#useDayPeriod) {
                focusSelector = '[data-ui-action="togglePeriod"]';
            }

            if (focusSelector) {
                const focusNode = $.findOne(focusSelector, this.#timeContainer);
                $.focus(focusNode);
            }
        };

        const showTime = (_) => {
            this.#timeViewMode = null;
            this.#refreshTime();

            $.insertAfter(this.#timeContainer, this.#dateContainer);
            $.setStyle(this.#timeContainer, { display: '' });
            $.squeezeIn(this.#timeContainer, {
                duration: 100,
            });
            $.squeezeOut(this.#dateContainer, {
                duration: 100,
            }).then((_) => {
                $.detach(this.#dateContainer);
                this.update();

                focusTime();
            });
        };

        const handleAction = (e) => {
            e.preventDefault();

            const element = e.currentTarget;
            const action = $.getDataset(element, 'uiAction');
            let tempDate = this.#date ?
                this.#date :
                this.#defaultDate;

            switch (action) {
                case 'setDate':
                    tempDate = tempDate.withYear(
                        $.getDataset(element, 'uiYear'),
                        $.getDataset(element, 'uiMonth'),
                        $.getDataset(element, 'uiDate'),
                    );

                    if (this.options.multiDate) {
                        let dates;
                        let granularity;

                        switch (this.#minView) {
                            case 'years':
                                granularity = 'year';
                                break;
                            case 'months':
                                granularity = 'month';
                                break;
                            default:
                                granularity = 'day';
                                break;
                        }

                        if (this.#isCurrent(tempDate, { granularity })) {
                            dates = this.#dates.filter((date) => !isSameDay(date, tempDate));
                        } else {
                            dates = this.#dates.concat([tempDate]);
                        }

                        this.#viewDate = tempDate;

                        this.#setDates(dates, { updateValue });
                    } else {
                        tempDate = this.#clampDate(tempDate);

                        if (this.#hasHours && !this.#isValid(tempDate)) {
                            let current = tempDate.startOfDay();
                            const endOfDay = tempDate.endOfDay();

                            while (current.isBefore(endOfDay)) {
                                if (this.#isValid(current)) {
                                    tempDate = current;
                                    break;
                                }

                                current = current.addMinutes(5);
                            }
                        }

                        this.#viewDate = tempDate;

                        this.#setDate(tempDate, { updateValue });

                        if (this.#hasHours) {
                            if (this.options.sideBySide) {
                                focusTime();
                            } else {
                                showTime();
                            }
                        } else if (!this.options.keepOpen && !this.#useModal && !this.options.inline) {
                            this.hide();
                            $.focus(this.node);
                        }
                    }

                    break;
                case 'changeView': {
                    this.#viewMode = $.getDataset(element, 'uiView');

                    if ($.hasDataset(element, 'uiYear')) {
                        this.#viewDate = this.#viewDate.withYear(
                            $.getDataset(element, 'uiYear'),
                            $.getDataset(element, 'uiMonth'),
                            $.getDataset(element, 'uiDate'),
                        );
                    }

                    this.#refreshDate();

                    const focusDate = $.findOne('[data-ui-focus="true"]', this.#dateContainer);
                    $.focus(focusDate);

                    break;
                }
                case 'showTime':
                    showTime();
                    break;
                case 'next':
                case 'prev': {
                    const amount = $.getDataset(element, 'uiAmount') || 1;
                    const unit = $.getDataset(element, 'uiUnit');

                    let method;
                    switch (unit) {
                        case 'month':
                            method = action === 'prev' ?
                                'subMonths' :
                                'addMonths';
                            break;
                        case 'year':
                            method = action === 'prev' ?
                                'subYears' :
                                'addYears';
                            break;
                    }

                    this.#viewDate = this.#viewDate[method](amount);

                    this.#refreshDate();

                    const focusAction = $.findOne(`[data-ui-action="${action}"]`, this.#dateContainer);
                    $.focus(focusAction);

                    break;
                }
                case 'close':
                    this.hide();
                    $.focus(this.node);
                    break;
            }
        };

        const refreshDate = () => {
            const year = this.#viewDate.getYear();
            const month = this.#viewDate.getMonth();
            const date = this.#viewDate.getDate();

            let focusSelector;

            switch (this.#viewMode) {
                case 'days':
                    focusSelector = `[data-ui-year="${year}"][data-ui-month="${month}"][data-ui-date="${date}"]`;
                    break;
                case 'months':
                    focusSelector = `[data-ui-year="${year}"][data-ui-month="${month}"]`;
                    break;
                case 'years':
                    focusSelector = `[data-ui-year="${year}"]`;
                    break;
            }

            let focusNode = $.findOne(focusSelector, this.#dateContainer);

            if (!focusNode) {
                this.#refreshDate();
                focusNode = $.findOne(focusSelector, this.#dateContainer);
            } else {
                const oldFocusNode = $.findOne('[data-ui-focus="true"]', this.#dateContainer);

                if (!$.isSame(focusNode, oldFocusNode)) {
                    $.setAttribute(oldFocusNode, { tabindex: -1 });
                    $.setDataset(oldFocusNode, { uiFocus: false });
                    $.setAttribute(focusNode, { tabindex: 0 });
                    $.setDataset(focusNode, { uiFocus: true });
                }
            }

            $.focus(focusNode);
        };

        $.addEventDelegate(this.#dateContainer, 'click.ui.datetimepicker', '[data-ui-action]', (e) => {
            if (e.button) {
                return;
            }

            handleAction(e);
        });

        $.addEventDelegate(this.#dateContainer, 'keydown.ui.datetimepicker', '[data-ui-action]', (e) => {
            switch (e.code) {
                case 'Enter':
                case 'NumpadEnter':
                case 'Space':
                    handleAction(e);
                    return;
            }
        });

        $.addEventDelegate(this.#dateContainer, 'mousedown.ui.datetimepicker', '[data-ui-focus="false"]', (e) => {
            let tempView = this.#viewDate;

            tempView = tempView.withYear(
                $.getDataset(e.currentTarget, 'uiYear'),
                $.getDataset(e.currentTarget, 'uiMonth'),
                $.getDataset(e.currentTarget, 'uiDate'),
            );

            if (tempView.isSame(this.#viewDate)) {
                return;
            }

            this.#viewDate = tempView;

            refreshDate();
        });

        $.addEvent(this.#dateContainer, 'keydown.ui.datetimepicker', (e) => {
            let tempView = this.#viewDate;

            switch (e.code) {
                case 'ArrowUp':
                    switch (this.#viewMode) {
                        case 'days':
                            if (e.ctrlKey) {
                                tempView = tempView.subYear();
                            } else {
                                tempView = tempView.subWeek();
                            }
                            break;
                        case 'months':
                            tempView = tempView.subMonths(3);
                            break;
                        case 'years':
                            tempView = tempView.subYears(3);
                            break;
                    }
                    break;
                case 'ArrowRight':
                    switch (this.#viewMode) {
                        case 'days':
                            if (e.ctrlKey) {
                                tempView = tempView.addMonth();
                            } else {
                                tempView = tempView.addDay();
                            }
                            break;
                        case 'months':
                            tempView = tempView.addMonth();
                            break;
                        case 'years':
                            tempView = tempView.addYear();
                            break;
                    }
                    break;
                case 'ArrowDown':
                    switch (this.#viewMode) {
                        case 'days':
                            if (e.ctrlKey) {
                                tempView = tempView.addYear();
                            } else {
                                tempView = tempView.addWeek();
                            }
                            break;
                        case 'months':
                            tempView = tempView.addMonths(3);
                            break;
                        case 'years':
                            tempView = tempView.addYears(3);
                            break;
                    }
                    break;
                case 'ArrowLeft':
                    switch (this.#viewMode) {
                        case 'days':
                            if (e.ctrlKey) {
                                tempView = tempView.subMonth();
                            } else {
                                tempView = tempView.subDay();
                            }
                            break;
                        case 'months':
                            tempView = tempView.subMonth();
                            break;
                        case 'years':
                            tempView = tempView.subYear();
                            break;
                    }
                    break;
                case 'Home':
                    switch (this.#viewMode) {
                        case 'days':
                            tempView = tempView.startOfWeek();
                            break;
                    }
                    break;
                case 'End':
                    switch (this.#viewMode) {
                        case 'days':
                            tempView = tempView.endOfWeek();
                            break;
                    }
                    break;
                case 'PageUp':
                    switch (this.#viewMode) {
                        case 'days':
                            tempView = tempView.subMonth();
                            break;
                    }
                    break;
                case 'PageDown':
                    switch (this.#viewMode) {
                        case 'days':
                            tempView = tempView.addMonth();
                            break;
                    }
                    break;
                default:
                    return;
            }

            e.preventDefault();

            if (tempView.isSame(this.#viewDate)) {
                return;
            }

            if (!this.#isBeforeMax(tempView, { allowSame: true }) || !this.#isAfterMin(tempView, { allowSame: true })) {
                return;
            }

            this.#viewDate = tempView;

            refreshDate();
        });
    }

    /**
     * Attach events for the Modal.
     */
    #eventsModal() {
        let originalDate;
        this.#keepDate = false;

        $.addEvent(this.#modal, 'show.ui.modal', (_) => {
            if (!$.triggerOne(this.node, 'show.ui.datetimepicker')) {
                return false;
            }

            if (this.options.multiDate) {
                originalDate = this.#dates;
            } else {
                originalDate = this.#date;
            }
        });

        $.addEvent(this.#modal, 'shown.ui.modal', (_) => {
            $.triggerEvent(this.node, 'shown.ui.datetimepicker');
        });

        $.addEvent(this.#modal, 'hide.ui.modal', (_) => {
            if (!$.triggerOne(this.node, 'hide.ui.datetimepicker')) {
                this.#keepDate = false;
                return false;
            }

            this.#activeTarget = null;

            if (this.#keepDate) {
                if (this.options.multiDate) {
                    this.#setDates(this.#dates);
                } else {
                    this.#setDate(this.#date);
                }
            }
        });

        $.addEvent(this.#modal, 'hidden.ui.modal', (_) => {
            if (!this.#keepDate) {
                if (this.options.multiDate) {
                    this.#setDates(originalDate);
                } else {
                    this.#setDate(originalDate);
                }
                originalDate = null;
            }

            this.#keepDate = false;
            $.detach(this.#modal);
            $.triggerEvent(this.node, 'hidden.ui.datetimepicker');
        });

        $.addEvent(this.#setBtn, 'click.ui.modal', (_) => {
            this.#keepDate = true;
        });
    }

    /**
     * Attach time events for the DateTimePicker.
     */
    #eventsTime() {
        const updateValue = !this.#useModal;

        const switchPeriod = (date) => {
            const currentHours = date.getHours();
            return date.withHours(
                currentHours + (currentHours < 12 ? 12 : -12),
            );
        };

        const handleAction = (e) => {
            e.preventDefault();

            const element = e.currentTarget;
            const action = $.getDataset(element, 'uiAction');
            let tempDate = this.#date ?
                this.#date :
                this.#defaultDate;
            let focusSelector;

            switch (action) {
                case 'setHours':
                    tempDate = tempDate.withHours(
                        $.getDataset(element, 'uiHour'),
                    );

                    this.#timeViewMode = null;

                    this.#setDate(tempDate, { updateValue });

                    if (this.#hasMinutes) {
                        focusSelector = '[data-ui-action="changeView"][data-ui-time-view="minutes"]';
                    } else if (this.#useDayPeriod) {
                        focusSelector = '[data-ui-action="togglePeriod"]';
                    }

                    break;
                case 'setMinutes':
                    tempDate = tempDate.withMinutes(
                        $.getDataset(element, 'uiMinute'),
                    );

                    this.#timeViewMode = null;

                    this.#setDate(tempDate, { updateValue });

                    if (this.#useDayPeriod) {
                        focusSelector = '[data-ui-action="togglePeriod"]';
                    }

                    break;
                case 'togglePeriod':
                    tempDate = switchPeriod(tempDate);

                    this.#setDate(tempDate, { updateValue });

                    focusSelector = '[data-ui-action="togglePeriod"]';

                    break;
                case 'changeView':
                    this.#timeViewMode = $.getDataset(element, 'uiTimeView');

                    this.#refreshTime();

                    focusSelector = '[data-ui-focus="true"]';

                    break;
                case 'next':
                case 'prev': {
                    const unit = $.getDataset(element, 'uiUnit');
                    const amount = unit === 'minute' ?
                        this.options.minuteStepping :
                        1;

                    let method;
                    switch (unit) {
                        case 'hour':
                            method = action === 'prev' ?
                                'subHours' :
                                'addHours';
                            break;
                        case 'minute':
                            method = action === 'prev' ?
                                'subMinutes' :
                                'addMinutes';
                            break;
                    }

                    tempDate = tempDate[method](amount);

                    this.#setDate(tempDate, { updateValue });

                    focusSelector = `[data-ui-action="${action}"][data-ui-unit="${unit}"]`;

                    break;
                }
                case 'showDate':
                    $.insertBefore(this.#dateContainer, this.#timeContainer);
                    $.setStyle(this.#dateContainer, { display: '' });
                    $.squeezeIn(this.#dateContainer, {
                        duration: 100,
                    });
                    $.squeezeOut(this.#timeContainer, {
                        duration: 100,
                    }).then((_) => {
                        $.detach(this.#timeContainer);
                        this.update();

                        const focusDate = $.findOne('[data-ui-focus="true"]', this.#dateContainer);
                        $.focus(focusDate);
                    });
                    break;
                case 'close':
                    if (!this.#date && !this.#hasDate) {
                        this.#setDate(this.#viewDate);
                    }

                    this.hide();
                    $.focus(this.node);
                    break;
            }

            if (focusSelector) {
                const focusNode = $.findOne(focusSelector, this.#timeContainer);
                $.focus(focusNode);
            }
        };

        $.addEventDelegate(this.#timeContainer, 'click.ui.datetimepicker', '[data-ui-action]', (e) => {
            if (e.button) {
                return;
            }

            handleAction(e);
        });

        $.addEventDelegate(this.#timeContainer, 'keydown.ui.datetimepicker', '[data-ui-action]', (e) => {
            switch (e.code) {
                case 'Enter':
                case 'NumpadEnter':
                case 'Space':
                    handleAction(e);
                    return;
            }

            const action = $.getDataset(e.currentTarget, 'uiAction');

            let tempDate = this.#date ?
                this.#date :
                this.#defaultDate;
            let focusSelector;

            switch (action) {
                case 'setHours':
                    break;
                case 'togglePeriod':
                    switch (e.code) {
                        case 'ArrowUp':
                        case 'ArrowDown':
                            tempDate = switchPeriod(tempDate);

                            focusSelector = `[data-ui-action="${action}"]`;
                            break;
                        default:
                            return;
                    }
                    break;
                default: {
                    let timeView;
                    switch (action) {
                        case 'changeView':
                            timeView = $.getDataset(e.currentTarget, 'uiTimeView');
                            break;
                        case 'prev':
                        case 'next': {
                            const unit = $.getDataset(e.currentTarget, 'uiUnit');
                            switch (unit) {
                                case 'hour':
                                    timeView = 'hours';
                                    break;
                                case 'minute':
                                    timeView = 'minutes';
                                    break;
                            }
                            break;
                        }
                        default:
                            if (this.#timeViewMode) {
                                return;
                            }

                            timeView = 'hours';
                            break;
                    }

                    switch (e.code) {
                        case 'ArrowUp':
                            switch (timeView) {
                                case 'hours':
                                    tempDate = tempDate.addHour();
                                    break;
                                case 'minutes':
                                    tempDate = tempDate.addMinutes(this.options.minuteStepping);
                                    break;
                            }

                            break;
                        case 'ArrowDown':
                            switch (timeView) {
                                case 'hours':
                                    tempDate = tempDate.subHour();
                                    break;
                                case 'minutes':
                                    tempDate = tempDate.subMinutes(this.options.minuteStepping);
                                    break;
                            }

                            break;
                        default:
                            return;
                    }

                    focusSelector = `[data-ui-action="changeView"][data-ui-time-view="${timeView}"]`;
                    break;
                }
            }

            const newDate = !this.#date || !tempDate.isSame(this.#date);

            if (newDate || focusSelector) {
                e.preventDefault();
            }

            if (newDate) {
                this.#setDate(tempDate, { updateValue });
            }

            if (focusSelector) {
                const focusNode = $.findOne(focusSelector, this.#timeContainer);
                $.focus(focusNode);
            }
        });

        $.addEventDelegate(this.#timeContainer, 'mousedown.ui.datetimepicker', '[data-ui-focus="false"]', (e) => {
            const focusNode = e.currentTarget;
            const oldFocusNode = $.findOne('[data-ui-focus="true"]', this.#timeContainer);

            if (!$.isSame(focusNode, oldFocusNode)) {
                $.setAttribute(oldFocusNode, { tabindex: -1 });
                $.setDataset(oldFocusNode, { uiFocus: false });
                $.setAttribute(focusNode, { tabindex: 0 });
                $.setDataset(focusNode, { uiFocus: true });
            }

            $.focus(focusNode);
        });

        $.addEvent(this.#timeContainer, 'keydown.ui.datetimepicker', (e) => {
            let focusNode;

            switch (this.#timeViewMode) {
                case 'hours':
                case 'minutes': {
                    const nodes = $.find('[data-ui-focus]', this.#timeContainer);
                    const focusedIndex = $.indexOf(nodes, '[data-ui-focus="true"]') || 0;
                    switch (e.code) {
                        case 'ArrowUp':
                            focusNode = nodes[focusedIndex - 4];
                            break;
                        case 'ArrowRight':
                            focusNode = nodes[focusedIndex + 1];
                            break;
                        case 'ArrowDown':
                            focusNode = nodes[focusedIndex + 4];
                            break;
                        case 'ArrowLeft':
                            focusNode = nodes[focusedIndex - 1];
                            break;
                        default:
                            return;
                    }

                    break;
                }
                default:
                    return;
            }

            e.preventDefault();

            if (!focusNode) {
                return;
            }

            const oldFocusNode = $.findOne('[data-ui-focus="true"]', this.#timeContainer);

            if (!$.isSame(focusNode, oldFocusNode)) {
                $.setAttribute(oldFocusNode, { tabindex: -1 });
                $.setDataset(oldFocusNode, { uiFocus: false });
                $.setAttribute(focusNode, { tabindex: 0 });
                $.setDataset(focusNode, { uiFocus: true });
            }

            $.focus(focusNode);
        });
    }

    /**
     * Format a date.
     * @param {DateTime} [date] The date to format.
     * @returns {string} The formatted date.
     */
    #formatDate(date) {
        if (!date) {
            return '';
        }

        return date.format(this.#format);
    }

    /**
     * Format multiple dates.
     * @param {DateTime[]} [dates] The dates to format.
     * @returns {string} The formatted dates.
     */
    #formatDates(dates) {
        return dates
            .map((date) => date.format(this.#format))
            .join(this.options.multiDateSeparator);
    }

    /**
     * Determine whether a date is between min/max dates.
     * @param {DateTime} date The date to test.
     * @param {object} [options] The options for how to compare the dates.
     * @param {string} [options.granularity] The level of granularity to use for comparison.
     * @param {boolean} [options.allowSame=false] Whether to also allow same check.
     * @returns {boolean} TRUE if the date is between min/max, otherwise FALSE.
     */
    #isAfterMin(date, { granularity = null, allowSame = false } = {}) {
        if (!this.#minDate) {
            return true;
        }

        switch (granularity) {
            case 'day':
                return (allowSame && isSameDay(date, this.#minDate)) || isAfterDay(date, this.#minDate);
            case 'month':
                return (allowSame && isSameMonth(date, this.#minDate)) || isAfterMonth(date, this.#minDate);
            case 'year':
                return (allowSame && isSameYear(date, this.#minDate)) || isAfterYear(date, this.#minDate);
            default:
                return (allowSame && isSameSecond(date, this.#minDate)) || isAfterSecond(date, this.#minDate);
        }
    }

    /**
     * Determine whether a date is between min/max dates.
     * @param {DateTime} date The date to test.
     * @param {object} [options] The options for how to compare the dates.
     * @param {string} [options.granularity] The level of granularity to use for comparison.
     * @param {boolean} [options.allowSame=false] Whether to also allow same check.
     * @returns {boolean} TRUE if the date is between min/max, otherwise FALSE.
     */
    #isBeforeMax(date, { granularity = null, allowSame = false } = {}) {
        if (!this.#maxDate) {
            return true;
        }

        switch (granularity) {
            case 'day':
                return (allowSame && isSameDay(date, this.#maxDate)) || isBeforeDay(date, this.#maxDate);
            case 'month':
                return (allowSame && isSameMonth(date, this.#maxDate)) || isBeforeMonth(date, this.#maxDate);
            case 'year':
                return (allowSame && isSameYear(date, this.#maxDate)) || isBeforeYear(date, this.#maxDate);
            default:
                return (allowSame && isSameSecond(date, this.#maxDate)) || isBeforeSecond(date, this.#maxDate);
        }
    }

    /**
     * Determine whether a date is a "current" date.
     * @param {DateTime} date The date to test.
     * @param {object} [options] The options for how to compare the dates.
     * @param {string} [options.granularity] The level of granularity to use for comparison.
     * @returns {boolean} TRUE if the date is a "current" date, otherwise FALSE.
     */
    #isCurrent(date, { granularity = null } = {}) {
        let callback;
        switch (granularity) {
            case 'month':
                callback = isSameMonth;
                break;
            case 'year':
                callback = isSameYear;
                break;
            default:
                callback = isSameDay;
                break;
        }

        if (this.options.multiDate) {
            return !!this.#dates.find((currentDate) => callback(date, currentDate));
        }

        return this.#date && callback(date, this.#date);
    }

    /**
     * Determine whether the input is editable.
     * @returns {boolean} TRUE if the input is editable, otherwise FALSE.
     */
    #isEditable() {
        return !$.is(this.node, ':disabled') && (this.options.ignoreReadonly || !$.is(this.node, ':read-only'));
    }

    /**
     * Determine whether a date is valid.
     * @param {DateTime} date The date to test.
     * @param {object} [options] The options for how to compare the dates.
     * @param {string} [options.granularity=second] The level of granularity to use for comparison.
     * @returns {boolean} TRUE if the date is valid, otherwise FALSE.
     */
    #isValid(date, { granularity = 'second' } = {}) {
        if (!date?.isValid || !Number.isFinite(date.getTimestamp())) {
            return false;
        }

        let minMaxGranularity;
        switch (granularity) {
            case 'year':
            case 'month':
            case 'day':
                minMaxGranularity = granularity;
                break;
        }

        if (!this.#isAfterMin(date, { granularity: minMaxGranularity, allowSame: true })) {
            return false;
        }

        if (!this.#isBeforeMax(date, { granularity: minMaxGranularity, allowSame: true })) {
            return false;
        }

        if (this.options.isValidYear && !this.options.isValidYear(date)) {
            return false;
        }

        if (granularity === 'year') {
            return true;
        }

        if (this.options.isValidMonth && !this.options.isValidMonth(date)) {
            return false;
        }

        if (granularity === 'month') {
            return true;
        }

        if (this.options.isValidDay && !this.options.isValidDay(date)) {
            return false;
        }

        if (granularity === 'day' || !this.#hasHours) {
            return true;
        }

        if (this.options.isValidTime && !this.options.isValidTime(date)) {
            return false;
        }

        return true;
    }

    /**
     * Create a new DateTime object from format.
     * @param {string} date The date string.
     * @returns {DateTime|null} The new DateTime.
     */
    #makeDate(date) {
        if (date === null) {
            return date;
        }

        date = `${date}`.trim();

        if (date === '') {
            return null;
        }

        const formats = [this.#format, ...this.options.altFormats];

        for (const format of formats) {
            try {
                const newDate = DateTime.fromFormat(format, date, this.#dateOptions);

                if (!newDate.isValid) {
                    continue;
                }

                return this.#clampStepping(newDate);
            } catch {
                // A format mismatch may still match one of the alternate formats.
            }
        }

        return null;
    }

    /**
     * Create a new DateTime object set to the current date/time.
     * @returns {DateTime} The new DateTime.
     */
    #now() {
        return this.#clampStepping(DateTime.now(this.#dateOptions));
    }

    /**
     * Parses a date input. Strings use the configured format or altFormats.
     * @param {DateInput} date The date to parse.
     * @returns {DateTime|null} The parsed date, or null for missing or invalid input.
     */
    #parseDate(date) {
        if (date === null || date === undefined || date === '') {
            return null;
        }

        if (date instanceof DateTime) {
            return date.isValid && Number.isFinite(date.getTimestamp()) ?
                date.withLocale(this.#dateOptions.locale).withTimeZone(this.#dateOptions.timeZone) :
                null;
        }

        if (typeof date === 'string') {
            return this.#makeDate(date);
        }

        let parsed;
        try {
            if (date instanceof Date && Number.isFinite(date.getTime())) {
                parsed = DateTime.fromDate(date, this.#dateOptions);
            } else if (typeof date === 'number' && Number.isFinite(date)) {
                parsed = DateTime.fromTimestamp(date, this.#dateOptions);
            } else if (Array.isArray(date) && date.length && date.length <= 7 &&
                date.every((value) => Number.isFinite(value))) {
                parsed = DateTime.fromArray(date, this.#dateOptions);
            }
        } catch {
            return null;
        }

        return parsed?.isValid && Number.isFinite(parsed.getTimestamp()) ? parsed : null;
    }

    /**
     * Parse DateTime objects from an array of values.
     * @param {DateInput[]|null} dates The dates to parse, or null to clear the selection.
     * @returns {DateTime[]} An array of parsed DateTime objects.
     * @throws {TypeError} When a non-array selection is supplied.
     */
    #parseDates(dates) {
        if (dates === null || dates === undefined) {
            return [];
        }

        if (!Array.isArray(dates)) {
            throw new TypeError('multiDate requires an array of dates or null.');
        }

        return dates
            .map((date) => this.#parseDate(date))
            .filter((date) => !!date);
    }

    /**
     * Refresh the date and time UI elements.
     */
    #refresh() {
        if (this.options.showToolbar) {
            if (this.#date) {
                if (this.#hasYear) {
                    $.setText(this.#toolbarYear, this.#date.format('yyyy'));
                }

                if (this.#hasDate) {
                    $.setText(this.#toolbarDate, this.#date.format('LLL d'));
                } else if (this.#hasMonth) {
                    $.setText(this.#toolbarDate, this.#date.format('LLL'));
                }

                if (this.#hasHours) {
                    const timeFormat = getDefaultTimeFormat(this.#dateOptions.locale, this.#useDayPeriod);
                    $.setText(this.#toolbarTime, this.#date.format(timeFormat));
                }
            } else {
                if (this.#hasYear) {
                    $.setText(this.#toolbarYear, '-');
                }

                if (this.#hasDate) {
                    $.setText(this.#toolbarDate, '- -');
                } else if (this.#hasMonth) {
                    $.setText(this.#toolbarDate, '-');
                }

                if (this.#hasHours) {
                    const timeFormat = this.#useDayPeriod ? '-:- -' : '-:-';
                    $.setText(this.#toolbarTime, timeFormat);
                }
            }
        }

        if (this.#hasYear && $.isConnected(this.#dateContainer)) {
            this.#refreshDate();
        }

        if (this.#hasHours && $.isConnected(this.#timeContainer)) {
            this.#refreshTime();
        }

        if (this.#hasYear && this.#hasHours && !this.options.sideBySide && this.#isEditable()) {
            const showDate = $.findOne('[data-ui-action="showDate"]', this.#showDateTable);
            const showTime = $.findOne('[data-ui-action="showTime"]', this.#showTimeTable);

            $.setAttribute(showDate, { tabindex: 0 });
            $.setAttribute(showTime, { tabindex: 0 });
        }
    }

    /**
     * Refresh the date container.
     */
    #refreshDate() {
        $.empty(this.#dateContainer);

        switch (this.#viewMode) {
            case 'years':
                this.#renderYears();
                break;
            case 'months':
                this.#renderMonths();
                break;
            case 'days':
                this.#renderDays();
                break;
        }

        if (this.#hasHours && !this.options.sideBySide) {
            if (this.#useModal) {
                $.prepend(this.#dateContainer, this.#showTimeTable);
            } else {
                $.append(this.#dateContainer, this.#showTimeTable);
            }
        }

        if (this.options.showClose && !this.#useModal && !this.options.inline && !this.#hasHours) {
            $.append(this.#dateContainer, this.#closeTable);
        }

        if (!this.#isEditable()) {
            const focusableNodes = $.find('[tabindex]', this.#dateContainer);
            $.setAttribute(focusableNodes, { tabindex: -1 });
        }

        this.update();

        $.triggerEvent(this.node, 'refresh.ui.datetimepicker', {
            detail: {
                view: 'date',
                viewMode: this.#viewMode,
                viewDate: this.#viewDate,
            },
        });
    }

    /**
     * Refresh the toggle disabled.
     */
    #refreshDisabled() {
        if ($.is(this.node, ':disabled')) {
            $.addClass(this.#menuNode, this.constructor.classes.disabled);
        } else {
            $.removeClass(this.#menuNode, this.constructor.classes.disabled);
        }
    }

    /**
     * Refresh the time container.
     */
    #refreshTime() {
        $.empty(this.#timeContainer);

        if (this.#hasDate && !this.options.sideBySide) {
            $.append(this.#timeContainer, this.#showDateTable);
        }

        switch (this.#timeViewMode) {
            case 'hours':
                this.#renderHours();
                break;
            case 'minutes':
                this.#renderMinutes();
                break;
            default:
                this.#renderTime();
                break;
        }

        if (this.options.showClose && !this.#useModal && !this.options.inline) {
            $.append(this.#timeContainer, this.#closeTable);
        }

        if (!this.#isEditable()) {
            const focusableNodes = $.find('[tabindex]', this.#timeContainer);
            $.setAttribute(focusableNodes, { tabindex: -1 });
        }

        this.update();

        $.triggerEvent(this.node, 'refresh.ui.datetimepicker', {
            detail: {
                view: 'time',
                viewMode: this.#timeViewMode,
                viewDate: this.#viewDate,
            },
        });
    }

    /**
     * Render the DateTimePicker.
     */
    #render() {
        this.#menuNode = $.create('div', {
            class: this.constructor.classes.menu,
        });

        if (this.options.showToolbar) {
            this.#renderToolbar();
        }

        this.#container = $.create('div', {
            class: this.constructor.classes.container,
        });
        $.append(this.#menuNode, this.#container);

        if (this.#hasYear) {
            this.#dateContainer = $.create('div', {
                class: this.constructor.classes.column,
            });

            if (!this.#hasHours || this.options.sideBySide) {
                $.append(this.#container, this.#dateContainer);
            }
        }

        if (this.#hasHours) {
            this.#timeContainer = $.create('div', {
                class: this.constructor.classes.column,
            });

            if (!this.#hasDate || this.options.sideBySide) {
                $.append(this.#container, this.#timeContainer);
            }
        }

        if (this.#hasDate && this.#hasHours) {
            if (!this.options.sideBySide) {
                this.#showTimeTable = this.#createTable({
                    body: (tbody) => {
                        const tr = $.create('tr');
                        $.append(tbody, tr);

                        const td = $.create('td', {
                            html: this.constructor.icons.time,
                            class: [
                                this.constructor.classes.action,
                                this.constructor.classes.navigation,
                                this.constructor.classes.spacingNav,
                            ],
                            attributes: {
                                'colspan': 7,
                                'role': 'button',
                                'tabindex': 0,
                                'aria-label': this.constructor.lang.selectTime,
                            },
                            dataset: {
                                uiAction: 'showTime',
                            },
                        });

                        $.append(tr, td);
                    },
                });

                this.#showDateTable = this.#createTable({
                    body: (tbody) => {
                        const row = $.create('tr');
                        $.append(tbody, row);

                        const td = $.create('td', {
                            html: this.constructor.icons.date,
                            class: [
                                this.constructor.classes.action,
                                this.constructor.classes.navigation,
                                this.constructor.classes.spacingNav,
                            ],
                            attributes: {
                                'colspan': 4,
                                'role': 'button',
                                'tabindex': 0,
                                'aria-label': this.constructor.lang.selectDate,
                            },
                            dataset: {
                                uiAction: 'showDate',
                            },
                        });

                        $.append(row, td);
                    },
                });
            } else if (!this.options.vertical) {
                $.addClass(this.#menuNode, this.constructor.classes.menuWide);
                $.addClass(this.#container, this.constructor.classes.containerColumns);
            }
        }

        if (this.options.showClose && !this.#useModal && !this.options.inline) {
            this.#closeTable = this.#createTable({
                body: (tbody) => {
                    const row = $.create('tr');
                    $.append(tbody, row);

                    const td = $.create('td', {
                        html: this.constructor.icons.close,
                        class: [
                            this.constructor.classes.action,
                            this.constructor.classes.navigation,
                            this.constructor.classes.spacingNav,
                        ],
                        attributes: {
                            'colspan': 4,
                            'role': 'button',
                            'tabindex': 0,
                            'aria-label': this.constructor.lang.close,
                        },
                        dataset: {
                            uiAction: 'close',
                        },
                    });

                    $.append(row, td);
                },
            });
        }

        if (this.#useModal) {
            $.addClass(this.#menuNode, 'datetimepicker-modal');
        } else if (this.options.inline) {
            $.addClass(this.#menuNode, this.constructor.classes.menuInline);

            $.after(this.node, this.#menuNode);
            $.hide(this.node);
        } else {
            $.addClass(this.#menuNode, this.constructor.classes.menuShadow);
            $.setAttribute(this.#menuNode, {
                'role': 'dialog',
                'aria-modal': true,
            });
        }
    }

    /**
     * Render the days picker.
     */
    #renderDays() {
        const start = this.#viewDate.startOfMonth();
        const end = this.#viewDate.endOfMonth();

        let current = start.startOfWeek();
        const last = end.endOfWeek();

        let prev; let next;

        if (this.#isAfterMin(start)) {
            prev = {
                dataset: {
                    uiAction: 'prev',
                    uiUnit: 'month',
                },
                attributes: {
                    'aria-label': this.constructor.lang.prevMonth,
                },
            };
        }

        if (this.#isBeforeMax(end)) {
            next = {
                dataset: {
                    uiAction: 'next',
                    uiUnit: 'month',
                },
                attributes: {
                    'aria-label': this.constructor.lang.nextMonth,
                },
            };
        }

        const table = this.#createTable({
            header: {
                title: this.#viewDate.format('LLLL yyyy'),
                dataset: {
                    uiAction: 'changeView',
                    uiView: 'months',
                },
                attributes: {
                    'aria-label': this.constructor.lang.selectMonth,
                    'aria-live': 'polite',
                },
                prev,
                next,
            },
            head: (thead) => {
                const tr = $.create('tr');
                $.append(thead, tr);

                for (let i = 1; i <= 7; i++) {
                    const currentDay = current.withWeekDay(i);
                    const th = $.create('th', {
                        class: this.constructor.classes.days,
                        text: currentDay.dayName('short'),
                        attributes: {
                            scope: 'col',
                            abbr: currentDay.dayName('long'),
                        },
                    });
                    $.append(tr, th);
                }
            },
            body: (tbody) => {
                let tr;
                const now = this.#now();

                while (current.isSameOrBeforeDay(last)) {
                    if (current.getWeekDay() === 1) {
                        tr = $.create('tr');
                        $.append(tbody, tr);
                    }

                    const td = $.create('td', {
                        text: current.format('dd'),
                        attributes: {
                            role: 'button',
                        },
                        dataset: {
                            uiYear: current.getYear(),
                            uiMonth: current.getMonth(),
                            uiDate: current.getDate(),
                        },
                    });

                    if (this.options.ariaFormat) {
                        $.setAttribute(td, {
                            'aria-label': current.format(this.options.ariaFormat),
                        });
                    }

                    $.append(tr, td);

                    if (!this.#isValid(current, { granularity: 'day' })) {
                        $.addClass(td, this.constructor.classes.disabled);
                        $.setAttribute(td, { 'aria-disabled': true });
                    } else {
                        $.addClass(td, this.constructor.classes.action);
                        $.setDataset(td, {
                            uiAction: 'setDate',
                        });
                    }

                    if (this.#viewDate.isSameDay(current)) {
                        $.setAttribute(td, {
                            tabindex: 0,
                        });
                        $.setDataset(td, {
                            uiFocus: true,
                        });
                    } else {
                        $.setAttribute(td, {
                            tabindex: -1,
                        });
                        $.setDataset(td, {
                            uiFocus: false,
                        });
                    }

                    if (this.#isCurrent(current, { granularity: 'day' })) {
                        $.addClass(td, this.constructor.classes.active);
                        $.setAttribute(td, { 'aria-selected': true });
                    } else if (!this.#viewDate.isSameMonth(current)) {
                        $.addClass(td, this.constructor.classes.tertiary);
                    }

                    if (now.isSameDay(current)) {
                        $.addClass(td, this.constructor.classes.today);
                    }

                    if (this.options.renderDay) {
                        this.options.renderDay(current, td);
                    }

                    current = current.addDay();
                }
            },
        });

        $.append(this.#dateContainer, table);
    }

    /**
     * Render the hours picker.
     */
    #renderHours() {
        const initialDate = this.#date ?
            this.#date :
            this.#defaultDate;

        let current = initialDate.startOfDay();
        const last = initialDate.endOfDay();

        const table = this.#createTable({
            borderless: true,
            body: (tbody) => {
                const tr = $.create('tr');
                $.append(tbody, tr);

                const td = $.create('td', {
                    class: this.constructor.classes.rowContainer,
                    attributes: {
                        colspan: 7,
                    },
                });
                $.append(tr, td);

                const row = $.create('div', {
                    class: this.constructor.classes.row,
                });
                $.append(td, row);

                while (current.isSameOrBeforeHour(last)) {
                    const hourString = current.format('HH');
                    const col = $.create('div', {
                        text: hourString,
                        class: this.constructor.classes.hourColumn,
                        attributes: {
                            'aria-label': hourString,
                        },
                    });
                    $.append(row, col);

                    if (!this.#isValid(current, { granularity: 'hour' })) {
                        $.addClass(col, this.constructor.classes.disabled);
                    } else {
                        $.addClass(col, this.constructor.classes.action);
                        $.setDataset(col, {
                            uiAction: 'setHours',
                            uiHour: current.getHours(),
                        });
                        $.setAttribute(col, { role: 'button ' });
                    }

                    if (initialDate.isSameHour(current)) {
                        $.setAttribute(col, {
                            tabindex: 0,
                        });
                        $.setDataset(col, {
                            uiFocus: true,
                        });
                    } else {
                        $.setAttribute(col, {
                            tabindex: -1,
                        });
                        $.setDataset(col, {
                            uiFocus: false,
                        });
                    }

                    if (this.#date && this.#date.isSameHour(current)) {
                        $.addClass(col, this.constructor.classes.active);
                        $.setAttribute(col, { 'aria-selected': true });
                    }

                    current = current.addHour();
                }
            },
        });

        $.append(this.#timeContainer, table);
    }

    /**
     * Render the minutes picker.
     */
    #renderMinutes() {
        const initialDate = this.#date ?
            this.#date :
            this.#defaultDate;

        let current = initialDate.startOfHour();
        const last = initialDate.endOfHour();

        const table = this.#createTable({
            borderless: true,
            body: (tbody) => {
                const tr = $.create('tr');
                $.append(tbody, tr);

                const td = $.create('td', {
                    class: this.constructor.classes.rowContainer,
                    attributes: {
                        colspan: 7,
                    },
                });
                $.append(tr, td);

                const row = $.create('div', {
                    class: this.constructor.classes.row,
                });
                $.append(td, row);

                const stepping = this.options.minuteStepping == 1 ?
                    5 :
                    this.options.minuteStepping;

                while (current.isSameOrBeforeMinute(last)) {
                    const minuteString = current.format('mm');
                    const col = $.create('span', {
                        text: minuteString,
                        class: this.constructor.classes.timeColumn,
                    });
                    $.append(row, col);

                    if (!this.#isValid(current, { granularity: 'minute' })) {
                        $.addClass(col, this.constructor.classes.disabled);
                    } else {
                        $.addClass(col, this.constructor.classes.action);
                        $.setDataset(col, {
                            uiAction: 'setMinutes',
                            uiMinute: current.getMinutes(),
                        });
                        $.setAttribute(col, {
                            'role': 'button',
                            'aria-label': minuteString,
                        });
                    }

                    if (initialDate.isSameMinute(current)) {
                        $.setAttribute(col, {
                            tabindex: 0,
                        });
                        $.setDataset(col, {
                            uiFocus: true,
                        });
                    } else {
                        $.setAttribute(col, {
                            tabindex: -1,
                        });
                        $.setDataset(col, {
                            uiFocus: false,
                        });
                    }

                    if (this.#date && this.#date.isSameMinute(current)) {
                        $.addClass(col, this.constructor.classes.active);
                        $.setAttribute(col, { 'aria-selected': true });
                    }

                    current = current.addMinutes(stepping);
                }

                if (!$.findOne('[data-ui-focus="true"]', row)) {
                    const col = $.findOne('[data-ui-focus="false"]', row);
                    $.setAttribute(col, {
                        tabindex: 0,
                    });
                    $.setDataset(col, {
                        uiFocus: true,
                    });
                }
            },
        });

        $.append(this.#timeContainer, table);
    }

    /**
     * Render the Modal.
     */
    #renderModal() {
        this.#modal = $.create('div', {
            class: this.constructor.classes.modal,
            attributes: {
                'tabindex': -1,
                'role': 'dialog',
                'aria-modal': true,
            },
        });

        const modalDialog = $.create('div', {
            class: this.constructor.classes.modalDialog,
        });

        $.append(this.#modal, modalDialog);

        const modalContent = $.create('div', {
            class: this.constructor.classes.modalContent,
        });

        $.append(modalDialog, modalContent);

        const modalHeader = $.create('div', {
            class: this.constructor.classes.modalHeader,
        });

        $.append(modalContent, modalHeader);

        let titleText;
        if (!this.#hasHours) {
            titleText = this.constructor.lang.selectDate;
        } else if (!this.#hasDate) {
            titleText = this.constructor.lang.selectTime;
        } else {
            titleText = this.constructor.lang.selectDateTime;
        }

        const modalTitle = $.create('h6', {
            class: this.constructor.classes.modalTitle,
            text: titleText,
        });

        $.append(modalHeader, modalTitle);

        const modalBody = $.create('div', {
            class: this.constructor.classes.modalBody,
        });

        $.append(modalContent, modalBody);

        $.append(modalBody, this.#menuNode);

        const modalFooter = $.create('div', {
            class: this.constructor.classes.modalFooter,
        });

        $.append(modalContent, modalFooter);

        const cancelBtn = $.create('button', {
            class: this.constructor.classes.modalBtnSecondary,
            text: this.constructor.lang.cancel,
            attributes: {
                'type': 'button',
                'data-ui-dismiss': 'modal',
            },
        });

        $.append(modalFooter, cancelBtn);

        this.#setBtn = $.create('button', {
            class: this.constructor.classes.modalBtnPrimary,
            text: this.constructor.lang.set,
            attributes: {
                'type': 'button',
                'data-ui-dismiss': 'modal',
                'data-ui-set-color': 'true',
            },
        });

        $.append(modalFooter, this.#setBtn);
    }

    /**
     * Render the months picker.
     */
    #renderMonths() {
        const start = this.#viewDate.startOfYear();
        const end = this.#viewDate.endOfYear();

        let current = start;

        let prev; let next;

        if (this.#isAfterMin(start)) {
            prev = {
                dataset: {
                    uiAction: 'prev',
                    uiUnit: 'year',
                },
                attributes: {
                    'aria-label': this.constructor.lang.prevYear,
                },
            };
        }

        if (this.#isBeforeMax(end)) {
            next = {
                dataset: {
                    uiAction: 'next',
                    uiUnit: 'year',
                },
                attributes: {
                    'aria-label': this.constructor.lang.nextYear,
                },
            };
        }

        const table = this.#createTable({
            header: {
                title: this.#viewDate.format('yyyy'),
                wide: true,
                dataset: {
                    uiAction: 'changeView',
                    uiView: 'years',
                },
                attributes: {
                    'aria-label': this.constructor.lang.selectYear,
                },
                prev,
                next,
            },
            body: (tbody) => {
                const tr = $.create('tr');
                $.append(tbody, tr);

                const td = $.create('td', {
                    class: this.constructor.classes.rowContainer,
                    attributes: {
                        colspan: 7,
                    },
                });
                $.append(tr, td);

                const row = $.create('div', {
                    class: this.constructor.classes.row,
                });
                $.append(td, row);

                while (current.isSameOrBeforeMonth(end)) {
                    const col = $.create('div', {
                        text: current.format('LLL'),
                        class: this.constructor.classes.dateColumn,
                    });
                    $.append(row, col);

                    if (this.#viewDate.isSameMonth(current)) {
                        $.setAttribute(col, {
                            tabindex: 0,
                        });
                        $.setDataset(col, {
                            uiFocus: true,
                        });
                    } else {
                        $.setAttribute(col, {
                            tabindex: -1,
                        });
                        $.setDataset(col, {
                            uiFocus: false,
                        });
                    }

                    if (this.#isCurrent(current, { granularity: 'month' })) {
                        $.addClass(col, this.constructor.classes.active);
                    }

                    if (!this.#isValid(current, { granularity: 'month' })) {
                        $.addClass(col, this.constructor.classes.disabled);
                    } else {
                        $.addClass(col, this.constructor.classes.action);
                        if (this.#minView === 'months') {
                            $.setDataset(col, {
                                uiAction: 'setDate',
                                uiYear: current.getYear(),
                                uiMonth: current.getMonth(),
                            });
                        } else {
                            $.setDataset(col, {
                                uiAction: 'changeView',
                                uiView: 'days',
                                uiYear: current.getYear(),
                                uiMonth: current.getMonth(),
                            });
                        }
                    }

                    if (this.options.renderMonth) {
                        this.options.renderMonth(current, col);
                    }

                    current = current.addMonth();
                }
            },
        });

        $.append(this.#dateContainer, table);
    }

    /**
     * Render the time picker.
     */
    #renderTime() {
        const initialDate = this.#date ?
            this.#date :
            this.#defaultDate;

        const table = this.#createTable({
            borderless: true,
            body: (tbody) => {
                const separators = this.#hasHours + this.#hasMinutes - 1;
                const columns = this.#hasHours + this.#hasMinutes + this.#useDayPeriod;
                const separatorWidth = 3;
                const cellWidth = (100 - (separators * separatorWidth)) / columns;

                const upTr = $.create('tr');
                $.append(tbody, upTr);

                const timeTr = $.create('tr');
                $.append(tbody, timeTr);

                const downTr = $.create('tr');
                $.append(tbody, downTr);

                if (this.#hasHours) {
                    let increment; let decrement;

                    const nextHour = initialDate.addHour();
                    if (this.#isValid(nextHour, { granularity: 'hour' })) {
                        increment = {
                            dataset: {
                                uiAction: 'next',
                                uiUnit: 'hour',
                            },
                            attributes: {
                                'aria-label': this.constructor.lang.incrementHour,
                            },
                        };
                    }

                    const prevHour = initialDate.subHour();
                    if (this.#isValid(prevHour, { granularity: 'hour' })) {
                        decrement = {
                            dataset: {
                                uiAction: 'prev',
                                uiUnit: 'hour',
                            },
                            attributes: {
                                'aria-label': this.constructor.lang.decrementHour,
                            },
                        };
                    }

                    this.#renderTimeColumn({
                        increment,
                        select: {
                            text: initialDate.format(this.#useDayPeriod ? 'hh' : 'HH'),
                            dataset: {
                                uiAction: 'changeView',
                                uiTimeView: 'hours',
                            },
                            attributes: {
                                'aria-label': this.constructor.lang.selectHour,
                            },
                        },
                        decrement,
                        cellWidth,
                        upTr,
                        timeTr,
                        downTr,
                    });
                }

                if (this.#hasHours && this.#hasMinutes) {
                    this.#renderTimeSeparator({ separatorWidth, upTr, timeTr, downTr });
                }

                if (this.#hasMinutes) {
                    let increment; let decrement;

                    const initialMinutes = initialDate.getMinutes();
                    const nextMinutes = Math.min(initialMinutes + this.options.minuteStepping, 60);
                    const nextMinute = initialDate.withMinutes(nextMinutes);
                    if (this.#isValid(nextMinute, { granularity: 'minute' })) {
                        increment = {
                            dataset: {
                                uiAction: 'next',
                                uiUnit: 'minute',
                            },
                            attributes: {
                                'aria-label': this.constructor.lang.incrementMinute,
                            },
                        };
                    }

                    const prevMinute = initialDate.subMinutes(this.options.minuteStepping);
                    if (this.#isValid(prevMinute, { granularity: 'minute' })) {
                        decrement = {
                            dataset: {
                                uiAction: 'prev',
                                uiUnit: 'minute',
                            },
                            attributes: {
                                'aria-label': this.constructor.lang.decrementMinute,
                            },
                        };
                    }

                    this.#renderTimeColumn({
                        increment,
                        select: {
                            text: initialDate.format('mm'),
                            dataset: {
                                uiAction: 'changeView',
                                uiTimeView: 'minutes',
                            },
                            attributes: {
                                'aria-label': this.constructor.lang.selectMinute,
                            },
                        },
                        decrement,
                        cellWidth,
                        upTr,
                        timeTr,
                        downTr,
                    });
                }

                if (this.#useDayPeriod) {
                    const periodUpTd = $.create('td', {
                        style: {
                            width: `${cellWidth}%`,
                        },
                    });
                    $.append(upTr, periodUpTd);

                    const periodTd = $.create('td');
                    $.append(timeTr, periodTd);

                    const periodButton = $.create('span', {
                        text: initialDate.format('aa').toUpperCase(),
                        class: this.constructor.classes.periodButton,
                        attributes: {
                            'role': 'button',
                            'tabindex': 0,
                            'aria-label': this.constructor.lang.togglePeriod,
                        },
                    });

                    const currentHours = initialDate.getHours();
                    const otherPeriod = initialDate.withHours(
                        currentHours + (currentHours < 12 ? 12 : -12),
                    );
                    if (!this.#isValid(otherPeriod)) {
                        $.addClass(periodButton, this.constructor.classes.disabled);
                        $.setAttribute(periodButton, {
                            'aria-disabled': true,
                        });
                    } else {
                        $.setDataset(periodButton, {
                            uiAction: 'togglePeriod',
                        });
                    }

                    $.append(periodTd, periodButton);

                    const periodDownCell = $.create('td');
                    $.append(downTr, periodDownCell);
                }
            },
        });

        $.append(this.#timeContainer, table);
    }

    /**
     * Render a time column.
     * @param {object} options Options for rendering the column.
     */
    #renderTimeColumn(options) {
        const upTd = $.create('td', {
            html: this.constructor.icons.up,
            class: [
                this.constructor.classes.navigation,
                this.constructor.classes.time,
                this.constructor.classes.spacingTimeNav,
            ],
            style: {
                width: `${options.cellWidth}%`,
            },
        });

        if (!options.increment) {
            $.addClass(upTd, this.constructor.classes.disabled);
        } else {
            $.addClass(upTd, this.constructor.classes.action);
            $.setDataset(upTd, options.increment.dataset);
            $.setAttribute(upTd, {
                role: 'button',
                tabindex: 0,
                ...options.increment.attributes,
            });
        }

        $.append(options.upTr, upTd);

        const selectTd = $.create('td', {
            text: options.select.text,
            class: [
                this.constructor.classes.action,
                this.constructor.classes.time,
                this.constructor.classes.spacingTime,
            ],
            dataset: options.select.dataset,
            attributes: {
                role: 'button',
                tabindex: 0,
                ...options.select.attributes,
            },
        });
        $.append(options.timeTr, selectTd);

        const downTd = $.create('td', {
            html: this.constructor.icons.down,
            class: [
                this.constructor.classes.navigation,
                this.constructor.classes.time,
                this.constructor.classes.spacingTimeNav,
            ],
        });

        if (!options.decrement) {
            $.addClass(downTd, this.constructor.classes.disabled);
        } else {
            $.addClass(downTd, this.constructor.classes.action);
            $.setDataset(downTd, options.decrement.dataset);
            $.setAttribute(downTd, {
                role: 'button',
                tabindex: 0,
                ...options.decrement.attributes,
            });
        }

        $.append(options.downTr, downTd);
    }

    /**
     * Render a time separator column.
     * @param {object} options Options for rendering the separator column.
     */
    #renderTimeSeparator(options) {
        const seperatorUpTd = $.create('td', {
            style: {
                width: `${options.separatorWidth}%`,
            },
        });
        $.append(options.upTr, seperatorUpTd);

        const separatorTd = $.create('td', {
            text: ':',
            class: [
                this.constructor.classes.time,
                this.constructor.classes.spacingSeparator,
            ],
        });
        $.append(options.timeTr, separatorTd);

        const separatorDownTd = $.create('td');
        $.append(options.downTr, separatorDownTd);
    }

    /**
     * Render the toolbar.
     */
    #renderToolbar() {
        const toolbarRow = $.create('div', {
            class: this.constructor.classes.toolbarRow,
        });

        if (!this.#useModal) {
            $.addClass(toolbarRow, this.constructor.classes.toolbarPadding);
        }

        $.append(this.#menuNode, toolbarRow);

        if (this.#hasYear) {
            const toolbarDateContainer = $.create('div');

            $.append(toolbarRow, toolbarDateContainer);

            this.#toolbarYear = $.create('div', {
                class: this.constructor.classes.toolbarYear,
            });

            $.append(toolbarDateContainer, this.#toolbarYear);

            if (this.#hasMonth) {
                this.#toolbarDate = $.create('div', {
                    class: this.constructor.classes.toolbarDate,
                });

                $.append(toolbarDateContainer, this.#toolbarDate);
            }
        }

        if (this.#hasHours) {
            const toolbarTimeContainer = $.create('div');

            $.append(toolbarRow, toolbarTimeContainer);

            this.#toolbarTime = $.create('span', {
                class: this.constructor.classes.toolbarTime,
            });

            $.append(toolbarTimeContainer, this.#toolbarTime);
        }
    }

    /**
     * Render the years picker.
     */
    #renderYears() {
        const viewYear = this.#viewDate.getYear();
        const startYear = viewYear - (viewYear % 10);
        const endYear = startYear + 9;

        const start = this.#viewDate.withYear(startYear).startOfYear();
        const end = this.#viewDate.withYear(endYear).endOfYear();

        let current = start.subYear();
        const last = end.addYear();

        let prev; let next;

        if (this.#isAfterMin(start)) {
            prev = {
                dataset: {
                    uiAction: 'prev',
                    uiUnit: 'year',
                    uiAmount: 10,
                },
                attributes: {
                    'aria-label': this.constructor.lang.prevDecade,
                },
            };
        }

        if (this.#isBeforeMax(end)) {
            next = {
                dataset: {
                    uiAction: 'next',
                    uiUnit: 'year',
                    uiAmount: 10,
                },
                attributes: {
                    'aria-label': this.constructor.lang.nextDecade,
                },
            };
        }

        const table = this.#createTable({
            header: {
                title: `${start.format('yyyy')} - ${end.format('yyyy')}`,
                wide: true,
                prev,
                next,
            },
            body: (tbody) => {
                const tr = $.create('tr');
                $.append(tbody, tr);

                const td = $.create('td', {
                    class: this.constructor.classes.rowContainer,
                    attributes: {
                        colspan: 7,
                    },
                });
                $.append(tr, td);

                const row = $.create('div', {
                    class: this.constructor.classes.row,
                });
                $.append(td, row);

                while (current.isSameOrBeforeYear(last)) {
                    const currentYear = current.getYear();

                    const yearString = current.format('yyyy');
                    const col = $.create('div', {
                        text: yearString,
                        class: this.constructor.classes.dateColumn,
                        attributes: {
                            'aria-label': yearString,
                        },
                    });
                    $.append(row, col);

                    if (this.#viewDate.isSameYear(current)) {
                        $.setAttribute(col, {
                            tabindex: 0,
                        });
                        $.setDataset(col, {
                            uiFocus: true,
                        });
                    } else {
                        $.setAttribute(col, {
                            tabindex: -1,
                        });
                        $.setDataset(col, {
                            uiFocus: false,
                        });
                    }

                    if (this.#isCurrent(current, { granularity: 'year' })) {
                        $.addClass(col, this.constructor.classes.active);
                    } else if (currentYear < startYear || currentYear > endYear) {
                        $.addClass(col, this.constructor.classes.tertiary);
                    }

                    if (!this.#isValid(current, { granularity: 'year' })) {
                        $.addClass(col, this.constructor.classes.disabled);
                    } else {
                        $.addClass(col, this.constructor.classes.action);
                        if (this.#minView === 'years') {
                            $.setDataset(col, {
                                uiAction: 'setDate',
                                uiYear: currentYear,
                            });
                        } else {
                            $.setDataset(col, {
                                uiAction: 'changeView',
                                uiView: 'months',
                                uiYear: currentYear,
                            });
                        }
                        $.setAttribute(col, { role: 'button ' });
                    }

                    if (this.options.renderYear) {
                        this.options.renderYear(current, col);
                    }

                    current = current.addYear();
                }
            },
        });

        $.append(this.#dateContainer, table);
    }

    /**
     * Reset the view.
     */
    #resetView() {
        this.#viewMode = this.#minView;
        this.#timeViewMode = null;

        if (this.options.multiDate && this.#dates.length) {
            this.#viewDate = this.#dates[0];
        } else if (this.#date) {
            this.#viewDate = this.#date;
        } else {
            this.#viewDate = this.#defaultDate;
            this.#viewMode = this.#defaultView;
        }

        if (this.#hasDate && this.#hasHours && !this.options.sideBySide) {
            $.detach(this.#timeContainer);
            $.append(this.#container, this.#dateContainer);
        }
    }

    /**
     * Set the current date.
     * @param {DateTime|null} [date] The input date.
     * @param {object} options The options for setting the date.
     * @param {boolean} [options.updateValue=true] Whether to update the value.
     */
    #setDate(date, { updateValue = true } = {}) {
        if (!this.#isEditable()) {
            return;
        }

        if (date) {
            date = this.#clampStepping(date);
        }

        if (date && !this.#isValid(date)) {
            date = null;
        }

        const oldDate = this.#date;
        this.#date = date;

        this.#refresh();

        const oldValue = $.getValue(this.node);
        const newValue = this.#formatDate(date);

        if (!updateValue || oldValue === newValue) {
            return;
        }

        this.#updateValue();

        $.triggerEvent(this.node, 'change.ui.datetimepicker', {
            data: {
                skipUpdate: true,
            },
            detail: {
                old: oldDate,
                new: this.#date,
            },
        });
    }

    /**
     * Set the current dates.
     * @param {DateTime[]} dates The input dates.
     * @param {object} options The options for setting the date.
     * @param {boolean} [options.updateValue=true] Whether to update the value.
     */
    #setDates(dates, { updateValue = true } = {}) {
        if (!this.#isEditable()) {
            return;
        }

        dates = dates
            .filter((date) => this.#isValid(date))
            .sort((a, b) => isBeforeSecond(a, b) ? -1 : 1);

        const oldDates = this.#dates;
        this.#dates = dates;

        this.#refresh();

        const oldValue = $.getValue(this.node);
        const newValue = this.#formatDates(dates);

        if (!updateValue || oldValue === newValue) {
            return;
        }

        this.#updateValue();

        $.triggerEvent(this.node, 'change.ui.datetimepicker', {
            data: {
                skipUpdate: true,
            },
            detail: {
                old: oldDates,
                new: this.#dates.slice(),
            },
        });
    }

    /**
     * Update the input value to the current date.
     */
    #updateValue() {
        let value;
        if (this.options.multiDate) {
            value = this.#formatDates(this.#dates);
        } else {
            value = this.#formatDate(this.#date);
        }

        $.setValue(this.node, value);
    }
}
