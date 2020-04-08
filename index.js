const { Transform } = require('stream');
const fs = require('fs');
const importFresh = require('import-fresh');
const Ajv = require('ajv');
const PluginError = require('plugin-error');
const chalk = require('chalk');
const fancyLog = require('fancy-log');
const $refParser = require('json-schema-ref-parser');

const pluginName = 'gulp-data-validate';

module.exports = ({
    schemaSuffix = '.schema.json',
    failOnError = false
} = {}) => {
    const stream = new Transform({ objectMode: true });

    stream._transform = async (file, enc, done) => {
        const ajv = new Ajv({ allErrors: true });
        const schemaPath = file.path.replace('.data.js', schemaSuffix);

        if (!fs.existsSync(schemaPath)) {
            fancyLog(`${chalk.cyan(pluginName)}: couldn't find a schema for ${chalk.yellow(file.relative)}, skipping it`);
            done(null, file);
            return;
        }

        try {
            const schemaData = importFresh(schemaPath);
            const moduleData = importFresh(file.path);
            const dereferencedSchemaData = await $refParser.dereference(schemaPath, schemaData, {});
            const validate = ajv.compile(dereferencedSchemaData);
            const moduleVariants = Object.values(moduleData.variants).map(v => v.props);

            moduleVariants.forEach((variant, idx) => {
                const valid = validate(variant);

                if (!valid) {
                    const name = Object.keys(moduleData.variants)[idx];

                    validate.errors.forEach(error => {
                        fancyLog(`${chalk.cyan(pluginName)}: ${chalk.red(error.message)} ${chalk.red(JSON.stringify(error.params))} in variant ${chalk.yellow(name)} in ${chalk.yellow(file.relative)}`);
                    });

                    if (failOnError) {
                        stream.emit('error', new PluginError(pluginName, `${file.relative} isn't valid!`, {
                            fileName: file.path
                        }));
                    }
                }
            });

            done(null, file);
        } catch (error) {
            stream.emit('error', new PluginError(pluginName, error, {
                fileName: file.path
            }));
        }
    };

    return stream;
};
