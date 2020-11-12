const { Transform } = require('stream');
const fs = require('fs');
const path = require('path');
const fresh = require('import-fresh');
const Ajv = require('ajv');
const PluginError = require('plugin-error');
const chalk = require('chalk');
const fancyLog = require('fancy-log');
const $refParser = require('json-schema-ref-parser');

const pluginName = 'gulp-data-validate';

module.exports = ({
  schemaSuffix = '.schema.json',
  failOnError = false,
  ignorePrefix = '_'
} = {}) => new Transform({
  objectMode: true,
  async transform(file, _encoding, done) {
    const ajv = new Ajv({ allErrors: true });
    const schemaPath = file.path.replace('.data.js', schemaSuffix);
    const fileName = path.basename(file.path);

    if (fileName.startsWith(ignorePrefix)) {
      return done(null, file);
    }

    if (!fs.existsSync(schemaPath)) {
      fancyLog(`${chalk.cyan(pluginName)}: couldn't find a schema for ${chalk.yellow(file.relative)}, skipping it`);
      return done(null, file);
    }

    try {
      const schemaData = fresh(schemaPath);
      const moduleData = fresh(file.path);
      const dereferencedSchemaData = await $refParser.dereference(schemaPath, schemaData, {});
      const validate = ajv.compile(dereferencedSchemaData);
      const moduleVariants = Object.values(moduleData.variants).map(v => v.props);

      let variantIsValid = false;

      moduleVariants.forEach((variant, index) => {
        variantIsValid = validate(variant);

        if (!variantIsValid) {
          const name = Object.keys(moduleData.variants)[index];

          validate.errors.forEach(error => {
            fancyLog(`${chalk.cyan(pluginName)}: ${chalk.red(error.message)} ${chalk.red(JSON.stringify(error.params))} in variant ${chalk.yellow(name)} in ${chalk.yellow(file.relative)}`);
          });
        }
      });

      if (failOnError && !variantIsValid) {
        return this.emit('error', new PluginError(pluginName, `${file.relative} isn't valid!`, {
          fileName: file.path
        }));
      }

      return done(null, file);
    } catch (error) {
      return this.emit('error', new PluginError(pluginName, error, {
        fileName: file.path
      }));
    }
  }
});
