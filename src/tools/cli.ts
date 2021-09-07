#!/usr/bin/env node
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { generateReporter } from './api';

const program = yargs(hideBin(process.argv))
  .scriptName('hermione-profiler-ui')
  .command('generate', 'Generates a report', (cmd) =>
    cmd
      .option('plugin', {
        alias: 'p',
        describe:
          'Path to a file with profiled information about plugins',
        array: true,
        required: true,
        type: 'string',
      })
      .option('target', {
        alias: 't',
        describe: 'Path of the report',
        array: false,
        default: './report',
        type: 'string',
      })
  )
  .strict()
  .parseSync();

generateReporter(program.plugin, program.target)
  .then(() =>
    console.log(`Report has been generated at: ${program.target}`)
  )
  .catch((err) =>
    console.error(`Unable to generate report: ${err.stack}`)
  );
