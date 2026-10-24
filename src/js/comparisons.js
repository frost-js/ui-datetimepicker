/** @import DateTime from '@fr0st/datetime'; */

/**
 * Checks whether a date is after another date (day).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is after the other date.
 */
export function isAfterDay(a, b) {
    return isAfterMonth(a, b) || (isSameMonth(a, b) && a.getDate() > b.getDate());
}

/**
 * Checks whether a date is after another date (month).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is after the other date.
 */
export function isAfterMonth(a, b) {
    return isAfterYear(a, b) || (isSameYear(a, b) && a.getMonth() > b.getMonth());
}

/**
 * Checks whether a date is after another date (instant).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is after the other date.
 */
export function isAfterInstant(a, b) {
    return a.getTime() > b.getTime();
}

/**
 * Checks whether a date is after another date (year).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is after the other date.
 */
export function isAfterYear(a, b) {
    return a.getYear() > b.getYear();
}

/**
 * Checks whether a date is before another date (day).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is before the other date.
 */
export function isBeforeDay(a, b) {
    return isBeforeMonth(a, b) || (isSameMonth(a, b) && a.getDate() < b.getDate());
}

/**
 * Checks whether a date is before another date (month).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is before the other date.
 */
export function isBeforeMonth(a, b) {
    return isBeforeYear(a, b) || (isSameYear(a, b) && a.getMonth() < b.getMonth());
}

/**
 * Checks whether a date is before another date (instant).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is before the other date.
 */
export function isBeforeInstant(a, b) {
    return a.getTime() < b.getTime();
}

/**
 * Checks whether a date is before another date (year).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is before the other date.
 */
export function isBeforeYear(a, b) {
    return a.getYear() < b.getYear();
}

/**
 * Checks whether a date is equal to another date (day).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is equal to the other date.
 */
export function isSameDay(a, b) {
    return isSameMonth(a, b) && a.getDate() === b.getDate();
}

/**
 * Checks whether a date is equal to another date (month).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is equal to the other date.
 */
export function isSameMonth(a, b) {
    return isSameYear(a, b) && a.getMonth() === b.getMonth();
}

/**
 * Checks whether a date is equal to another date (instant).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is equal to the other date.
 */
export function isSameInstant(a, b) {
    return a.getTime() === b.getTime();
}

/**
 * Checks whether a date is equal to another date (year).
 * @param {DateTime} a The date to test.
 * @param {DateTime} b The date to compare against.
 * @returns {boolean} Whether the date is equal to the other date.
 */
export function isSameYear(a, b) {
    return a.getYear() === b.getYear();
}
