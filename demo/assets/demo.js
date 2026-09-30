const $ = globalThis.fQuery;
const { DateTimePicker } = globalThis.UI;
const DateTime = globalThis.DateTime;

const themeKey = 'frostui-datetimepicker-demo-theme';
const themeSelect = document.querySelector('#demo-theme');
const setTheme = (theme) => {
    if (theme === 'system') {
        document.documentElement.removeAttribute('data-ui-theme');
    } else {
        document.documentElement.setAttribute('data-ui-theme', theme);
    }
    themeSelect.value = theme;
};

let storedTheme;
try {
    storedTheme = localStorage.getItem(themeKey);
} catch {
    // The demo still works when browser storage is unavailable.
}
const requestedTheme = new URLSearchParams(location.search).get('theme');
const initialTheme = requestedTheme || storedTheme;
setTheme(['light', 'dark'].includes(initialTheme) ? initialTheme : 'system');
themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    setTheme(theme);
    try {
        if (theme === 'system') {
            localStorage.removeItem(themeKey);
        } else {
            localStorage.setItem(themeKey, theme);
        }
    } catch {
        // Keep the selected theme for this page without persisting it.
    }
});

Object.assign(DateTimePicker.defaults, { locale: 'en-GB', mobileModal: false });
const today = DateTime.now({ locale: 'en-GB' }).startOfDay();
document.querySelector('#form-date').defaultValue = today.format('yyyy-MM-dd');

// Initialize callback/DateTime options before the shared selector, which reuses instances.
DateTimePicker.init(document.querySelector('#limited-date'), {
    format: 'yyyy-MM-dd',
    minDate: today,
    maxDate: today.addDays(30).endOfDay(),
});
document.querySelector('#limited-date').setAttribute('aria-describedby', 'limit-help');
document.querySelector('#limit-help').textContent = `${today.format('yyyy-MM-dd')} through ${today.addDays(30).format('yyyy-MM-dd')}, inclusive.`;

DateTimePicker.init(document.querySelector('#work-date'), {
    format: 'yyyy-MM-dd HH:mm',
    minuteStepping: 15,
    showClose: true,
    isValidDay: (date) => date.getWeekDay() >= 1 && date.getWeekDay() <= 5,
    isValidTime: (date) => date.getHours() >= 9 && date.getHours() < 17,
    renderDay: (date, node) => {
        if (date.getDate() === 15) {
            node.title = 'Planning day';
            node.classList.add('fw-bold', 'text-decoration-underline');
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
        DateTimePicker.init(document.getElementById(id)).setDate(instant);
    }
};
syncZones();
document.querySelector('#sync-zones').addEventListener('click', syncZones);
DateTimePicker.init(document.querySelector('#multi-date')).setDate([today, today.addDays(3)]);
DateTimePicker.init(document.querySelector('#modal-date')).setDate(today.withHours(9, 30));

const showInlineValue = () => {
    document.querySelector('#inline-value').textContent = `Selected: ${describeDate(DateTimePicker.init(document.querySelector('#inline-date')).getDate())}`;
};
$.addEvent('#inline-date', 'change.ui.datetimepicker', showInlineValue);
showInlineValue();

const form = document.querySelector('#booking-form');
const formInput = document.querySelector('#form-date');
const formResult = document.querySelector('#form-result');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = DateTimePicker.init(formInput).getDate();
    formResult.textContent = selected ? `bookingDate: ${new FormData(form).get('bookingDate')}` : 'Choose a valid booking day.';
});
form.addEventListener('reset', () => {
    formResult.textContent = `Reset to ${formInput.defaultValue}.`;
});
document.querySelector('#clear-form').addEventListener('click', () => DateTimePicker.init(formInput).clear());

const apiInput = document.querySelector('#api-date');
const apiResult = document.querySelector('#api-result');
const eventLog = document.querySelector('#event-log');
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
        const line = document.createElement('div');
        line.textContent = `${name}${detail ? `: ${detail}` : ''}`;
        eventLog.append(line);
        if (eventLog.children.length > 100) {
            eventLog.firstElementChild.remove();
        }
        eventLog.scrollTop = eventLog.scrollHeight;
    });
}
document.querySelector('#clear-log').addEventListener('click', () => eventLog.replaceChildren());

for (const button of document.querySelectorAll('[data-demo-method]')) {
    // Keep the API popup open until its explicit hide/toggle action is invoked.
    button.addEventListener('pointerdown', (event) => {
        if (event.button === 0) {
            event.preventDefault();
        }
    });
    button.addEventListener('click', () => {
        const method = button.dataset.demoMethod;
        let picker = $.getData(apiInput, DateTimePicker.DATA_KEY);
        if (method === 'init') {
            picker = DateTimePicker.init(apiInput);
        } else if (!picker) {
            apiResult.textContent = 'Disposed. Choose Init before calling another method.';
            return;
        }

        switch (method) {
            case 'init':
                apiResult.textContent = 'Initialized.';
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
                apiResult.textContent = `${method}: ${describeDate(picker[method]())}`;
                return;
            default:
                picker[method]();
                break;
        }
        apiResult.textContent = `${method} called. Input: ${apiInput.value || '(empty)'}`;
    });
}
