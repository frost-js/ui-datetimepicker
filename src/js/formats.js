const dayPeriods = {};
const defaultFormats = {};
const defaultDateFormats = {};
const defaultTimeFormats = {};

/**
 * Checks a locale for day period component (and cache).
 * @param {string} locale The locale to check.
 * @returns {boolean} Whether the locale uses a day period component.
 */
export function checkDayPeriod(locale) {
    if (!(locale in dayPeriods)) {
        const formatter = new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
        });

        dayPeriods[locale] = Boolean(
            formatter.formatToParts(new Date())
                .find((part) => part.type === 'dayPeriod'),
        );
    }

    return dayPeriods[locale];
}

/**
 * Gets the default date format for a locale.
 * @param {string} locale The input locale.
 * @returns {string} The default date format.
 */
export function getDefaultDateFormat(locale) {
    if (!(locale in defaultDateFormats)) {
        defaultDateFormats[locale] = formatFromParts(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }

    return defaultDateFormats[locale];
}

/**
 * Gets the default format for a locale.
 * @param {string} locale The input locale.
 * @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock; defaults to the locale.
 * @returns {string} The default format.
 */
export function getDefaultFormat(locale, hasDayPeriod = checkDayPeriod(locale)) {
    const key = `${locale}:${hasDayPeriod}`;
    if (!(key in defaultFormats)) {
        defaultFormats[key] = formatFromParts(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }, hasDayPeriod);
    }

    return defaultFormats[key];
}

/**
 * Gets the default time format for a locale.
 * @param {string} locale The input locale.
 * @param {boolean} [hasDayPeriod] Whether to use a 12-hour clock; defaults to the locale.
 * @returns {string} The default time format.
 */
export function getDefaultTimeFormat(locale, hasDayPeriod = checkDayPeriod(locale)) {
    const key = `${locale}:${hasDayPeriod}`;
    if (!(key in defaultTimeFormats)) {
        defaultTimeFormats[key] = formatFromParts(locale, {
            hour: '2-digit',
            minute: '2-digit',
        }, hasDayPeriod);
    }

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
    const formatter = new Intl.DateTimeFormat(locale, {
        ...options,
        hour12: hasDayPeriod,
    });

    return formatter.formatToParts(new Date())
        .map(
            (part) => {
                switch (part.type) {
                    case 'year':
                        return 'yyyy';
                    case 'month':
                        return 'MM';
                    case 'day':
                        return 'dd';
                    case 'hour':
                        return hasDayPeriod ?
                            'hh' :
                            'HH';
                    case 'minute':
                        return 'mm';
                    case 'dayPeriod':
                        return 'a';
                }

                if (part.value === ', ') {
                    return ' ';
                }

                if (!/[a-z]/i.test(part.value)) {
                    return part.value;
                }

                return `'${part.value}'`;
            },
        ).join('');
}
