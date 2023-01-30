// const {print} = require('q-i');
const path = require('path');
const glob = require('glob');
const R = require('ramda');
const {ProvidePlugin} = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const {
  setEntriesForPath,
  addRule,
  addPlugin,
  prependExtensions
} = require('./util/compose');
const env = require('./util/env');

const RESOURCES_PATH = 'src/main/resources';

// ----------------------------------------------------------------------------
// Base config
// ----------------------------------------------------------------------------

const config = {
  context: path.join(__dirname, RESOURCES_PATH),
  devtool: false, // Source maps are not usable in server scripts
  entry: {},
  externals: [
    /^\/lib\/(.+|\$)$/i,
    // {
      // TS externals
      // '@enonic-types/lib-event': '/lib/xp/event', // NOTE: I don't think this does anything
      // JS externals
      // NOTE: These are covered by the general regexp rule above
      // '/lib/xp/event': '/lib/xp/event',
      // '/lib/enonic/static': '/lib/enonic/static',
    // }
  ],
  mode: env.type,
  optimization: {
    minimize: true,
    // minimize: false, // DEBUG
    minimizer: [
      new TerserPlugin({
        // extractComments: false,
        extractComments: true,
        terserOptions: {
          compress: {
            // defaults: false // (default: true) -- Pass false to disable most default enabled compress transforms. Useful when you only want to enable a few compress options while disabling the rest.
            // dead_code: false, // (default: true) -- remove unreachable code
            drop_console: true, // (default: false) -- Pass true to discard calls to console.* functions. If you wish to drop a specific function call such as console.info and/or retain side effects from function arguments after dropping the function call then use pure_funcs instead.
            keep_classnames: true, // (default: false) -- Pass true to prevent the compressor from discarding class names. Pass a regular expression to only keep class names matching that regex. See also: the keep_classnames mangle option.
            keep_fnames: true, // (default: false) -- Pass true to prevent the compressor from discarding function names. Pass a regular expression to only keep function names matching that regex. Useful for code relying on Function.prototype.name. See also: the keep_fnames mangle option.
            module: true, // (default false) -- Pass true when compressing an ES6 module. Strict mode is implied and the toplevel option as well.
            passes: 10, // (default: 1) -- The maximum number of times to run compress. In some cases more than one pass leads to further compressed code. Keep in mind more passes will take more time.
            toplevel: true, // (default: false) -- drop unreferenced functions ("funcs") and/or variables ("vars") in the top level scope (false by default, true to drop both unreferenced functions and variables)
            // unused: false, // (default: true) -- drop unreferenced functions and variables (simple direct variable assignments do not count as references unless set to "keep_assign")
          },
          format: { // format or output (default null) — pass an object if you wish to specify additional format options. The defaults are optimized for best compression.
            // comments: 'all', // (default "some") -- by default it keeps JSDoc-style comments that contain "@license" or "@preserve", pass true or "all" to preserve all comments, false to omit comments in the output, a regular expression string (e.g. /^!/) or a function.
            // max_line_len: 80, // (default false) -- maximum line length (for minified code)
            semicolons: false, // (default true) -- separate statements with semicolons. If you pass false then whenever possible we will use a newline instead of a semicolon, leading to more readable output of minified code (size before gzip could be smaller; size after gzip insignificantly larger).
          },
          keep_classnames: true, // (default: undefined) - pass true to prevent discarding or mangling of class names. Pass a regular expression to only keep class names matching that regex.
          keep_fnames: true, //  (default: false) - pass true to prevent discarding or mangling of function names. Pass a regular expression to only keep class names matching that regex. Useful for code relying on Function.prototype.name. If the top level minify option keep_classnames is undefined it will be overridden with the value of the top level minify option keep_fnames.
          // mangle: false, // (default true) — pass false to skip mangling names, or pass an object to specify mangle options (see below).
          mangle: {
            keep_classnames: true, // (default false) -- Pass true to not mangle class names. Pass a regular expression to only keep class names matching that regex. See also: the keep_classnames compress option.
            keep_fnames: true, // (default false) -- Pass true to not mangle function names. Pass a regular expression to only keep class names matching that regex. Useful for code relying on Function.prototype.name. See also: the keep_fnames compress option.
            module: true, // (default false) -- Pass true an ES6 modules, where the toplevel scope is not the global scope. Implies toplevel.
            toplevel: true, // (default false) -- Pass true to mangle names declared in the top level scope.
          },
          module: true, // (default false) — Use when minifying an ES6 module. "use strict" is implied and names can be mangled on the top scope. If compress or mangle is enabled then the toplevel option will be enabled.
          // sourceMap: {} (default false) - pass an object if you wish to specify source map options.
          toplevel: true, // (default false) - set to true if you wish to enable top level variable and function name mangling and to drop unused variables and functions.
        },
      }),
    ],
    splitChunks: {
      minSize: 30000,
    },
    // usedExports: true // webpack 4?
  },
  output: {
    path: path.join(__dirname, '/build/resources/main'),
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: [],
  },
};

// ----------------------------------------------------------------------------
// JavaScript loaders
// ----------------------------------------------------------------------------

function listEntries(extensions, ignoreList) {
  const CLIENT_FILES = glob.sync(`${RESOURCES_PATH}/assets/**/*.${extensions}`);
  const IGNORED_FILES = R.pipe(
    R.map(entry => path.join(RESOURCES_PATH, entry)),
    R.concat(CLIENT_FILES)
  )(ignoreList);
  const SERVER_FILES = glob.sync(`${RESOURCES_PATH}/**/*.${extensions}`, { absolute: false, ignore: IGNORED_FILES });
  return SERVER_FILES.map(entry => path.relative(RESOURCES_PATH, entry));
}

// TYPESCRIPT
// function addTypeScriptSupport(cfg) {
//   const rule = {
//     test: /\.ts$/,
//     exclude: /node_modules/,
//     loader: 'ts-loader',
//     options: {
//       configFile: 'tsconfig.json',
//     }
//   };

//   const entries = listEntries('ts', [
//     // Add additional files to the ignore list.
//     // The following path will be transformed to 'src/main/resources/types.ts:
//     'types.ts'
//   ]).filter(entry => entry.indexOf('.d.ts') === -1);

//   return R.pipe(
//     setEntriesForPath(entries),
//     addRule(rule),
//     addPlugin(new ProvidePlugin({
//       'Object.assign': [path.join(__dirname, RESOURCES_PATH, 'polyfills'), 'assign']
//     })),
//     prependExtensions(['.ts', '.json'])
//   )(cfg);
// }

// BABEL
// function addBabelSupport(cfg) {
//   const rule = {
//     test: /\.(es6?|js)$/,
//     exclude: /node_modules/,
//     loader: 'babel-loader',
//     options: {
//       babelrc: false,
//       plugins: [],
//       presets: [
//         [
//           '@babel/preset-env',
//           {
//             // Use custom Browserslist config
//             targets: 'node 0.10',
//             // Polyfills are not required in runtime
//             useBuiltIns: false
//           },
//         ],
//       ]
//     }
//   };

//   const entries = listEntries('{js,es,es6}', [
//     // Add additional files to the ignore list.
//     // The following path will be transformed to 'src/main/resources/lib/observe/observe.ts':
//     'lib/observe/observe.ts'
//   ]);

//   return R.pipe(
//     setEntriesForPath(entries),
//     addRule(rule),
//     prependExtensions(['.js', '.es', '.es6', '.json'])
//   )(cfg);
// }

// SWC (instead of typescript and babel)
function addSWC(cfg) {
  const rule = {
    test: /\.([ejt]s6?)?$/,
    use: {
      loader: 'swc-loader',
      options: {
        env: {
          coreJs: '3.27.2',
          // mode: 'entry',
          // mode: 'usage',
        },
        jsc: {
            keepClassNames: true,
            minify: {
              compress: {
                dead_code: true, // defaults to false
                drop_console: true, // defaults to false
                // ecma: 6, // defaults to 5
                keep_classnames: true, // defaults to false.
                keep_fargs: true, // defaults to false.
                // module, // Ignored. Currently, all files are treated as module
                // toplevel: false, // defaults to true
                // unused: false // defaults to true
              },
              mangle: true
            },
            parser: {
                syntax: 'typescript'
            },
            target: 'es5',
        },
        minify: true,
        module: {
          type: 'commonjs'
        },
        // sync: true, // Run syncronously to get correct error messages
    }
    },
    exclude: /node_modules/,
  }
  const entries = listEntries('{ts,js,es,es6}',[])
    .filter(entry => entry.indexOf('.d.ts') === -1);
  return R.pipe(
    setEntriesForPath(entries),
    addRule(rule),
    prependExtensions(['.ts', '.js', '.es', '.es6', '.json'])
  )(cfg);
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = R.pipe(
  // addBabelSupport,
  // addTypeScriptSupport,
  addSWC,
)(config);
// print(module.exports, { maxItems: Infinity });