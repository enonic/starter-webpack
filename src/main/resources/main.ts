import { init } from '/lib/observe/observe';

// Test that descontruction works after transpilation.
const obj = {prop:'value'};
const {prop} = obj;
log.info(prop);

init();
