import { init } from '/lib/observe/observe'; // Using absolute path, so it will be externaled (not inlined).
import { importedFunction } from './lib/testTreeShaking'; // Using relative path so it will be inlined (not externaled)

// Test that descontruction works after transpilation.
const obj = {prop:'value'};
const {prop} = obj;
log.info(prop);

importedFunction();

init();
