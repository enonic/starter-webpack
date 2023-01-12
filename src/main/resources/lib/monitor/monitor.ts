import type {EnonicEvent} from '@enonic-types/lib-event';
import {listener} from '/lib/xp/event';

function logEvent({timestamp, data}: EnonicEvent): void {
    log.info(`${new Date(timestamp)}: ${JSON.stringify(data)}`);
}

export function init() {
  log.info('Hello from transpiled TS server-side code.');

  try {
    listener({
      type: 'node.*',
      localOnly: false,
      callback: logEvent,
    });

  } catch (e) {
    log.error(e);
  }
}
