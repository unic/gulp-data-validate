import { Transform } from 'stream';

interface ValidateOptions {
  schemaSuffix?: string,
  failOnError?: boolean,
  ignorePrefix?: string
}

declare function validate(validateOptions?: ValidateOptions): Transform;

export = validate;
