const { Transform } = require('stream');
const importFresh = require('import-fresh');
const Ajv = require('ajv');
const PluginError = require('plugin-error');
const chalk = require('chalk');
const fancyLog = require('fancy-log');
const $refParser = require('json-schema-ref-parser');

const pluginName = 'gulp-data-validate';

module.exports = ({
    schemaSuffix = '.schema.js',
    failOnError = false
} = {}) => {
    const stream = new Transform({ objectMode: true });

    stream._transform = async (file, enc, cb) => {
        const ajv = new Ajv({ allErrors: true });
        const schemaPath = file.path.replace('.data.js', schemaSuffix);

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

            cb(null, file);
        } catch (error) {
            stream.emit('error', new PluginError(pluginName, error, {
                fileName: file.path
            }));
        }
    };

    return stream;
};
