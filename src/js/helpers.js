import $ from '@fr0st/query';

/**
 * Creates a table.
 * @param {Record<string, string>} classes The component classes.
 * @param {Record<string, string>} icons The component icons.
 * @param {object} options Options for rendering the table.
 * @returns {HTMLElement} The new table.
 */
export function createTable(classes, icons, options) {
    const table = $.create('table', {
        class: classes.table,
    });

    if (options.header) {
        const thead = $.create('thead');
        $.append(table, thead);

        const tr = $.create('tr');
        $.append(thead, tr);

        const prevTd = $.create('th', {
            html: icons.left,
            class: classes.navigation,
        });

        if (!options.header.prev) {
            $.addClass(prevTd, classes.disabled);
        } else {
            $.addClass(prevTd, classes.action);
            $.setDataset(prevTd, options.header.prev.dataset);
            $.setAttribute(prevTd, {
                role: 'button',
                tabindex: 0,
                ...options.header.prev.attributes,
            });
        }

        $.append(tr, prevTd);

        const titleTd = $.create('th', {
            class: classes.title,
            text: options.header.title,
            attributes: {
                colspan: 5,
                ...options.header.attributes,
            },
        });

        if (options.header.dataset) {
            $.addClass(titleTd, classes.action);
            $.setDataset(titleTd, options.header.dataset);
            $.setAttribute(titleTd, {
                role: 'button',
                tabindex: 0,
            });
        }

        if (options.header.wide) {
            $.addClass(titleTd, classes.titleWide);
        }

        $.append(tr, titleTd);

        const nextTd = $.create('th', {
            html: icons.right,
            class: classes.navigation,
        });

        if (!options.header.next) {
            $.addClass(nextTd, classes.disabled);
        } else {
            $.addClass(nextTd, classes.action);
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
 * Gets the key for a selected day, month, or year.
 * @param {DateTime} date The date.
 * @param {'days'|'months'|'years'} minView The calendar precision.
 * @returns {string} The selection key.
 */
export function getDateKey(date, minView) {
    if (minView === 'years') {
        return String(date.getYear());
    }

    if (minView === 'months') {
        return `${date.getYear()}-${date.getMonth()}`;
    }

    return `${date.getYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Renders a time column.
 * @param {Record<string, string>} classes The component classes.
 * @param {Record<string, string>} icons The component icons.
 * @param {object} options Options for rendering the column.
 */
export function renderTimeColumn(classes, icons, options) {
    const upTd = $.create('td', {
        html: icons.up,
        class: [
            classes.navigation,
            classes.time,
            classes.spacingTimeNav,
        ],
        style: {
            width: `${options.cellWidth}%`,
        },
    });

    if (!options.increment) {
        $.addClass(upTd, classes.disabled);
    } else {
        $.addClass(upTd, classes.action);
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
            classes.action,
            classes.time,
            classes.spacingTime,
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
        html: icons.down,
        class: [
            classes.navigation,
            classes.time,
            classes.spacingTimeNav,
        ],
    });

    if (!options.decrement) {
        $.addClass(downTd, classes.disabled);
    } else {
        $.addClass(downTd, classes.action);
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
 * Renders a time separator column.
 * @param {Record<string, string>} classes The component classes.
 * @param {object} options Options for rendering the separator column.
 */
export function renderTimeSeparator(classes, options) {
    const separatorUpTd = $.create('td', {
        style: {
            width: `${options.separatorWidth}%`,
        },
    });
    $.append(options.upTr, separatorUpTd);

    const separatorTd = $.create('td', {
        text: ':',
        class: [
            classes.time,
            classes.spacingSeparator,
        ],
    });

    $.append(options.timeTr, separatorTd);

    const separatorDownTd = $.create('td');
    $.append(options.downTr, separatorDownTd);
}
