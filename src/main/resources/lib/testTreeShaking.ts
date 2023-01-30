const NOT_EXIST = 'not exist';
const EXIST = 'exist';

export function notImportedFunction() {
    log.info(`${NOT_EXIST}: This function should exist in /build/resources/main/lib/testTreeShaking.js, but NOT in /build/resources/main/main.js`);
    return;
}

export function importedFunction() {
    log.info(`${EXIST}: This function should exist in /build/resources/main/lib/testTreeShaking.js and /build/resources/main/main.js`);
    return;
}
