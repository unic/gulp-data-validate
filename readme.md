# gulp-data-validate

[![latest version on npm](https://img.shields.io/npm/v/gulp-data-validate)](https://www.npmjs.com/package/gulp-data-validate)
[![npm downloads a month](https://img.shields.io/npm/dm/gulp-data-validate)](https://www.npmjs.com/package/gulp-data-validate)
[![required node version](https://img.shields.io/node/v/gulp-data-validate)](https://github.com/nodejs/Release)
[![package license](https://img.shields.io/npm/l/gulp-data-validate)](license)

> Validate data files against their respective JSON schemas

Uses [`ajv`](https://github.com/epoberezkin/ajv), [`json-schema-ref-parser`](https://github.com/APIDevTools/json-schema-ref-parser) and [`import-fresh`](https://github.com/sindresorhus/import-fresh) under the hood.

## How
Have a `*.data.js` and a `*.schema.json` file for your module on the same level. Pass in the data file to the plugin, and, boom: See whether it's valid. If it's not, it'll log what's to be done.

```bash
yarn add gulp-data-validate --dev
```

```
v modules
  v my-module
    > my-module.hbs
    > my-module.scss
    > my-module.js
    > my-module.data.js
    > my-module.schema.json
  > my-other-module
  > another-one
  > best-module
```

```js
const { src } = require('gulp');
const validate = require('gulp-data-validate');

module.exports.schema = src('modules/**/*.data.js').pipe(validate());
```

## Options
You can pass in an object containing three keys: `schemaSuffix`, `failOnError` and `ignorePrefix`. With those three, you can adapt to your naming scheme and control whether the build should fail when the data files aren't valid.

```js
const defaultOptions = {
  schemaSuffix: '.schema.json',
  failOnError: false,
  ignorePrefix: '_'
};
```

If your schemas are just named `*.json`, you want to skip schema validation for files beginning with `_` and you want the build to fail on error (nice for CI-purposes), your folder structure and config would look like this:

```
v modules
  v my-module
    > my-module.hbs
    > my-module.scss
    > my-module.js
    > my-module.data.js
    > my-module.json
    v partials
      _my-partial.hbs
      _my-partial.scss
      _my-partial.data.js
  > my-other-module
  > another-one
  > best-module
```

```js
const { src } = require('gulp');
const validate = require('gulp-data-validate');

module.exports.schema = src('modules/**/*.data.js').pipe(validate({
  schemaSuffix: '.json',
  failOnError: true,
  ignorePrefix: '_'
}));
```

## License
MIT
