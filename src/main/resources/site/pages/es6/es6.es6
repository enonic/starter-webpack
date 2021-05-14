const thl = require('/lib/thymeleaf');
const prt = require('/lib/xp/portal');

const view = resolve('html.html');

exports.get = (req) => {
    log.info("es6.es6 (es6.es6 changed?)");

    const model = {
        didChange: "es6.es6 didChange (es6.es6 changed?)",
        jsassetUrl: prt.assetUrl({path: 'jsasset.js'}),
        bundleUrl: prt.assetUrl({path: 'js/bundle.js'}), // <-- compiled?
    }

    return {
        body: thl.render(view, model)
    }
}
