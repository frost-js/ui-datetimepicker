const $ = globalThis.fQuery;
const { DateTimePicker } = globalThis.UI;
const DateTime = globalThis.DateTime;
const themeKey = 'frostui-datetimepicker-demo-theme';

const setTheme = (theme) => {
    if (theme === 'system') {
        $(document.documentElement).removeAttribute('data-ui-theme');
    } else {
        $(document.documentElement).setAttribute('data-ui-theme', theme);
    }

    $('[data-demo-theme]').setValue(theme);
};

const logEvent = (message, className = 'text-body-secondary') => {
    const log = $.findOne('#event-log');
    const entry = $.create('div', {
        class: ['small', 'font-monospace', 'py-2', 'border-bottom', className],
        text: message,
    });

    $.append(log, entry);

    while ($.children(log).length > 50) {
        $.remove($.child(log)[0]);
    }

    $.setScrollY(log, $.height(log, { boxSize: $.SCROLL_BOX }));
};

$.ready(() => {
    let storedTheme;

    try {
        storedTheme = localStorage.getItem(themeKey);
    } catch {
        // The demo remains usable when browser storage is unavailable.
    }

    const requestedTheme = new URLSearchParams(location.search).get('theme');
    const initialTheme = requestedTheme || storedTheme;
    setTheme(['light', 'dark'].includes(initialTheme) ? initialTheme : 'system');

    $('[data-demo-theme]').addEvent('change', (event) => {
        const theme = $.getValue(event.currentTarget);
        setTheme(theme);

        try {
            if (theme === 'system') {
                localStorage.removeItem(themeKey);
            } else {
                localStorage.setItem(themeKey, theme);
            }
        } catch {
            // Theme selection still applies for the current page.
        }
    });

    $('#clear-log').addEvent('click', () => {
        $('#event-log').empty();
    });

    Object.assign(DateTimePicker.defaults, { locale: 'en-GB', mobileModal: false });
    const today = DateTime.now({ locale: 'en-GB' }).startOfDay();
    $.setProperty($.findOne('#form-date'), 'defaultValue', today.format('yyyy-MM-dd'));

    // Initialize callback/DateTime options before the shared selector, which reuses instances.
    DateTimePicker.init($.findOne('#limited-date'), {
        format: 'yyyy-MM-dd',
        minDate: today,
        maxDate: today.addDays(30).endOfDay(),
    });
    $.setAttribute($.findOne('#limited-date'), 'aria-describedby', 'limit-help');
    $.setText($.findOne('#limit-help'), `${today.format('yyyy-MM-dd')} through ${today.addDays(30).format('yyyy-MM-dd')}, inclusive.`);

    DateTimePicker.init($.findOne('#work-date'), {
        format: 'yyyy-MM-dd HH:mm',
        minuteStepping: 15,
        showClose: true,
        isValidDay: (date) => date.getWeekDay() >= 1 && date.getWeekDay() <= 5,
        isValidTime: (date) => date.getHours() >= 9 && date.getHours() < 17,
        renderDay: (date, node) => {
            if (date.getDate() === 15) {
                $.setProperty(node, 'title', 'Planning day');
                $.addClass(node, 'fw-bold', 'text-decoration-underline');
            }
        },
    });

    $('[data-ui-toggle="datetimepicker"]').datetimepicker();

    /**
     * Formats a selected date or collection for demo output.
     * @param {DateTime|DateTime[]|null} date The date value.
     * @returns {string} The display text.
     */
    const describeDate = (date) => {
        if (Array.isArray(date)) {
            return date.map(describeDate).join('; ') || '(empty)';
        }
        return date ? date.format('yyyy-MM-dd HH:mm') : '(empty)';
    };

    const syncZones = () => {
        const instant = DateTime.now({ timeZone: 'UTC' });
        for (const id of ['zone-utc', 'zone-brisbane']) {
            DateTimePicker.init($.findOneById(id)).setDate(instant);
        }
    };
    syncZones();
    $.addEvent($.findOne('#sync-zones'), 'click', syncZones);
    DateTimePicker.init($.findOne('#multi-date')).setDate([today, today.addDays(3)]);
    DateTimePicker.init($.findOne('#modal-date')).setDate(today.withHours(9, 30));

    const showInlineValue = () => {
        $.setText($.findOne('#inline-value'), `Selected: ${describeDate(DateTimePicker.init($.findOne('#inline-date')).getDate())}`);
    };
    $.addEvent('#inline-date', 'change.ui.datetimepicker', showInlineValue);
    showInlineValue();

    const form = $.findOne('#booking-form');
    const formInput = $.findOne('#form-date');
    const formResult = $.findOne('#form-result');
    $.addEvent(form, 'submit', (event) => {
        event.preventDefault();
        const selected = DateTimePicker.init(formInput).getDate();
        $.setText(formResult, selected ? `bookingDate: ${new FormData(form).get('bookingDate')}` : 'Choose a valid booking day.');
    });
    $.addEvent(form, 'reset', () => {
        $.setText(formResult, `Reset to ${$.getProperty(formInput, 'defaultValue')}.`);
    });
    $.addEvent($.findOne('#clear-form'), 'click', () => DateTimePicker.init(formInput).clear());

    const apiInput = $.findOne('#api-date');
    const apiResult = $.findOne('#api-result');
    const events = ['show', 'shown', 'hide', 'hidden', 'change', 'refresh'];
    for (const name of events) {
        $.addEvent(apiInput, `${name}.ui.datetimepicker`, (event) => {
            let detail = '';
            if (name === 'change' && event.detail && 'new' in event.detail) {
                detail = `${describeDate(event.detail.old)} → ${describeDate(event.detail.new)}`;
            } else if (name === 'refresh') {
                detail = `${event.detail.view} / ${event.detail.viewMode || 'time controls'}`;
            } else if (name === 'change') {
                detail = 'native change';
            }
            logEvent(`${name}${detail ? `: ${detail}` : ''}`);
        });
    }

    for (const button of $.find('[data-demo-method]')) {
        // Keep the API popup open until its explicit hide/toggle action is invoked.
        $.addEvent(button, 'pointerdown', (event) => {
            if (event.button === 0) {
                event.preventDefault();
            }
        });
        $.addEvent(button, 'click', () => {
            const method = $.getDataset(button, 'demoMethod');
            let picker = $.getData(apiInput, DateTimePicker.DATA_KEY);
            if (method === 'init') {
                picker = DateTimePicker.init(apiInput);
            } else if (!picker) {
                $.setText(apiResult, 'Disposed. Choose Init before calling another method.');
                return;
            }

            switch (method) {
                case 'init':
                    $.setText(apiResult, 'Initialized.');
                    return;
                case 'setDate':
                    picker.setDate(DateTime.now());
                    break;
                case 'setMinDate':
                    picker.setMinDate(today.subMonths(3));
                    break;
                case 'setMaxDate':
                    picker.setMaxDate(today.addMonths(3).endOfDay());
                    break;
                case 'removeBounds':
                    picker.setMinDate(null);
                    picker.setMaxDate(null);
                    break;
                case 'getDate':
                case 'getMinDate':
                case 'getMaxDate':
                case 'getViewDate':
                    $.setText(apiResult, `${method}: ${describeDate(picker[method]())}`);
                    return;
                default:
                    picker[method]();
                    break;
            }
            $.setText(apiResult, `${method} called. Input: ${$.getValue(apiInput) || '(empty)'}`);
        });
    }
});
