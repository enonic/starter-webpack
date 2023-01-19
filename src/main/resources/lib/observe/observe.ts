import {format} from 'date-fns';
import {nb} from 'date-fns/locale'; // Import one of many languages to test that tree-shaking works.
import {listener} from '/lib/xp/event';

const logEvent = (event: unknown) => {
  log.info(JSON.stringify(event));
};

export function init() {
  log.info('Hello from transpiled ES6 server-side code. %s', format(
    new Date(),
    "'I dag er en' eeee",
    {
      locale: nb
    }
  ));
  try {
    listener({
      type: 'node.*',
      localOnly: false,
      callback: logEvent
    });

  } catch (e) {
    log.error(e);
  }
}
