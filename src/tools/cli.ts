#!/usr/bin/env node
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { generateReporter } from './api';

const program = yargs(hideBin(process.argv))
  .scriptName('hermione-profiler-ui')
  .command('generate', 'Generates a report', (cmd) =>
    cmd
      .option('plugin-profiles', {
        describe:
          'Paths to files with profiled information about plugins',
        array: true,
        required: true,
        type: 'string',
      })
      .option('output', {
        describe: 'Path of the report',
        array: false,
        default: './report',
        type: 'string',
      })
  )
  .strict()
  .parseSync();

generateReporter(program['plugin-profiles'], program.output)
  .then(() =>
    console.log(`Report has been generated at: ${program.output}`)
  )
  .catch((err) =>
    console.error(`Unable to generate report: ${err.stack}`)
  );
