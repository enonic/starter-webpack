const path = require('path');
const R = require('ramda');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const {
  setEntry,
  addRule,
  addPlugin,
  appendExtensions,
  prependExtensions
} = require('./util/compose');
const env = require('./util/env');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isProd = env.prod;

// ----------------------------------------------------------------------------
// Base config
// ----------------------------------------------------------------------------

const config = {
  context: path.join(__dirname, '/src/main/resources/assets'),
  entry: {},
  output: {
    path: path.join(__dirname, '/build/resources/main/assets'),
    filename: isProd ? '[name].[contenthash].js' : '[name].js',
  },
  resolve: {
    extensions: [],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false,
          },
        },
      }),
    ],
    splitChunks: {
      minSize: 30000,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      publicPath: '{{staticAssetUrl}}', // This placeholder be replaced with url for serving static assets
      template: path.join(__dirname, '/src/main/resources/template/main.html'),
    })
  ],
  mode: env.type,
  devtool: isProd ? false : 'inline-source-map',
}

// ----------------------------------------------------------------------------
// JavaScript loaders
// ----------------------------------------------------------------------------

// TYPESCRIPT
function addTypeScriptSupport(cfg) {
  const rule = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'ts-loader',
    options: {
      configFile: 'src/main/resources/assets/tsconfig.json',
    }
  };

  return R.pipe(
    setEntry('ts/bundle', './ts/main.ts'),
    addRule(rule),
    prependExtensions(['.tsx', '.ts', '.json'])
  )(cfg);
}

// BABEL
function addBabelSupport(cfg) {
  const rule = {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: [],
      presets: [
        [
          '@babel/preset-env',
          {
            // false means polyfill not required runtime
            useBuiltIns: false
          },
        ],
      ]
    }
  };

  return R.pipe(
    setEntry('js/bundle', './js/main.es6'),
    addRule(rule),
    prependExtensions(['es6', '.jsx', '.js', '.json'])
  )(cfg);
}

// ----------------------------------------------------------------------------
// CSS loaders
// ----------------------------------------------------------------------------

const createDefaultCssLoaders = () => ([
  {loader: MiniCssExtractPlugin.loader, options: {publicPath: '../'}},
  {loader: 'css-loader', options: {sourceMap: !isProd, importLoaders: 1}},
  {loader: 'postcss-loader', options: {sourceMap: !isProd}},
]);

const createCssPlugin = () => (
  new MiniCssExtractPlugin({
    filename: isProd ? 'styles/bundle.[contenthash].css' : 'styles/bundle.css',
    chunkFilename: isProd ? '[id].[contenthash].css' : '[id].css',
  })
);

// LESS
function addLessSupport(cfg) {
  const rule = {
    test: /\.less$/,
    use: [
      ...createDefaultCssLoaders(),
      {loader: 'less-loader', options: {sourceMap: !isProd}},
    ]
  };

  const plugin = createCssPlugin();

  return R.pipe(
    addRule(rule),
    addPlugin(plugin),
    appendExtensions(['.less', '.css'])
  )(cfg);
}

// SASS & SCSS
function addSassSupport(cfg) {
  const rule = {
    test: /\.(sass|scss)$/,
    use: [
      ...createDefaultCssLoaders(),
      {loader: 'sass-loader', options: {sourceMap: !isProd}},
    ]
  };

  const plugin = createCssPlugin();

  return R.pipe(
    addRule(rule),
    addPlugin(plugin),
    appendExtensions(['.sass', '.scss', '.css'])
  )(cfg);
}

// ----------------------------------------------------------------------------
// Resource loaders
// ----------------------------------------------------------------------------

// FONTS IN CSS
function addFontSupport(cfg) {
  const rule = {
    test: /\.(eot|woff|woff2|ttf|svg)$/,
    type: 'asset/resource',
  };

  return R.pipe(
    addRule(rule)
  )(cfg);
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = R.pipe(
  addBabelSupport,
  addTypeScriptSupport,
  addLessSupport,
  addSassSupport,
  addFontSupport
)(config);
