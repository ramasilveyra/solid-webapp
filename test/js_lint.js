import { paths } from '../config.js';
import lint from 'mocha-eslint';

// Array of paths to lint
// Note: a seperate Mocha test will be run for each file which matches the glob pattern
const globs = [
  `${paths.scripts.src}/*.js`,
  `!${paths.scripts.src}/plugins.js`,
  `${paths.dist}/**/*.js`,
  `!${paths.dist}/**/*.min.js`
];

// Options
const options = {
  formatter: 'compact',
  alwaysWarn: false
};

// Run the tests

// Awaiting mocha-eslint support multiple globs
// See: https://github.com/BadgeLabs/mocha-eslint/tree/multi-glob
// lint(globs, options);
