# gulp-data-validate
[![latest version on npm](https://img.shields.io/npm/v/gulp-data-validate)](https://www.npmjs.com/package/gulp-data-validate) [![npm downloads a month](https://img.shields.io/npm/dm/gulp-data-validate)](https://www.npmjs.com/package/gulp-data-validate) [![required node version](https://img.shields.io/node/v/gulp-data-validate)](https://github.com/nodejs/Release) [![dependency status](https://img.shields.io/david/unic/gulp-data-validate)](https://david-dm.org/unic/gulp-data-validate) [![package license](https://img.shields.io/npm/l/gulp-data-validate)](license)
> Validate data files against their respective JSON schemas

Uses [ajv](https://github.com/epoberezkin/ajv), [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser) and [import-fresh](https://github.com/sindresorhus/import-fresh) under the hood.

## How
Have a `*.data.js` and a `*.schema.json` file for your module on the same level. Pass in the data file to the plugin, and, boom: Check whether it's valid. If it's not, it'll log what's to be done.

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
const gulp = require('gulp');
const dataValidate = require('gulp-data-validate');

gulp.task('lint:json', () => {
    return gulp.src('modules/**/*.data.js')
        .pipe(dataValidate());
});
```

## Options
You can pass in an object containing two keys `schemaSuffix` and `failOnError`. With those two, you can adapt to your naming scheme and control whether the build should fail when the data files aren't valid.

```js
const defaultOptions = {
    schemaSuffix: '.schema.json',
    failOnError: false
};
```

```
v modules
    v my-module
        > my-module.hbs
        > my-module.scss
        > my-module.js
        > my-module.data.js
        > my-module.json
    > my-other-module
    > another-one
    > best-module
```

```js
const gulp = require('gulp');
const dataValidate = require('gulp-data-validate');

gulp.task('lint:json', () => {
    return gulp.src('modules/**/*.data.js')
        .pipe(dataValidate({
            schemaSuffix: '.json',
            failOnError: true
        }));
});
```

## License
MIT
