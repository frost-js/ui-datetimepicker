/**
 * Test if a date is after another date (day).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is after the other date, otherwise FALSE.
 */
export function isAfterDay(a, b) {
    return isAfterMonth(a, b) || (isSameMonth(a, b) && a.getDate() > b.getDate());
};

/**
 * Test if a date is after another date (month).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is after the other date, otherwise FALSE.
 */
export function isAfterMonth(a, b) {
    return isAfterYear(a, b) || (isSameYear(a, b) && a.getMonth() > b.getMonth());
};

/**
 * Test if a date is after another date (instant).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is after the other date, otherwise FALSE.
 */
export function isAfterInstant(a, b) {
    return a.getTime() > b.getTime();
};

/**
 * Test if a date is after another date (year).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is after the other date, otherwise FALSE.
 */
export function isAfterYear(a, b) {
    return a.getYear() > b.getYear();
};

/**
 * Test if a date is before another date (day).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is before the other date, otherwise FALSE.
 */
export function isBeforeDay(a, b) {
    return isBeforeMonth(a, b) || (isSameMonth(a, b) && a.getDate() < b.getDate());
};

/**
 * Test if a date is before another date (month).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is before the other date, otherwise FALSE.
 */
export function isBeforeMonth(a, b) {
    return isBeforeYear(a, b) || (isSameYear(a, b) && a.getMonth() < b.getMonth());
};

/**
 * Test if a date is before another date (instant).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is before the other date, otherwise FALSE.
 */
export function isBeforeInstant(a, b) {
    return a.getTime() < b.getTime();
};

/**
 * Test if a date is before another date (year).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is before the other date, otherwise FALSE.
 */
export function isBeforeYear(a, b) {
    return a.getYear() < b.getYear();
};

/**
 * Test if a date is equal to another date (day).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is equal to the other date, otherwise FALSE.
 */
export function isSameDay(a, b) {
    return isSameMonth(a, b) && a.getDate() === b.getDate();
};

/**
 * Test if a date is equal to another date (month).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is equal to the other date, otherwise FALSE.
 */
export function isSameMonth(a, b) {
    return isSameYear(a, b) && a.getMonth() === b.getMonth();
};

/**
 * Test if a date is equal to another date (instant).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is equal to the other date, otherwise FALSE.
 */
export function isSameInstant(a, b) {
    return a.getTime() === b.getTime();
};

/**
 * Test if a date is equal to another date (year).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} TRUE if the date is equal to the other date, otherwise FALSE.
 */
export function isSameYear(a, b) {
    return a.getYear() === b.getYear();
};
