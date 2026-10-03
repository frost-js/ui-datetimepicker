import $ from '@fr0st/query';
import { getClickTarget, initComponent } from '@fr0st/ui';
import DateTimePicker from './date-time-picker.js';

// DateTimePicker init
initComponent('datetimepicker', DateTimePicker);

// DateTimePicker events
$.addEvent(document, 'mousedown.ui.datetimepicker', (event) => {
    const target = getClickTarget(event);
    const nodes = $.find('.datetimepicker:not(.datetimepicker-inline):not(.datetimepicker-modal)');

    for (const node of nodes) {
        const input = $.getData(node, 'input');
        const datetimepicker = $.getData(input, DateTimePicker.DATA_KEY);

        if (!datetimepicker) {
            continue;
        }

        if (
            $.isSame(datetimepicker.node, target) ||
            $.isSame(node, target) ||
            $.hasDescendent(node, target)
        ) {
            continue;
        }

        datetimepicker.hide();
    }
}, { capture: true });

$.addEvent(document, 'keydown.ui.datetimepicker', (event) => {
    if (event.code !== 'Escape') {
        return;
    }

    let stopped = false;
    const nodes = $.find('.datetimepicker:not(.datetimepicker-inline):not(.datetimepicker-modal)');

    for (const [i, node] of nodes.entries()) {
        const input = $.getData(node, 'input');
        const datetimepicker = $.getData(input, DateTimePicker.DATA_KEY);

        if (!datetimepicker) {
            continue;
        }

        if (!stopped) {
            stopped = true;
            event.stopPropagation();
        }

        if (i === 0) {
            $.focus(input);
        }

        datetimepicker.hide();
    }
}, { capture: true });

export default DateTimePicker;
