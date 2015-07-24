/*eslint-env mocha */

import {paths} from '../config.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

const relativePath = paths.favicons.replace(paths.dist + '/', '');
const expectedFilesInDistDir = [
  'apple-touch-icon.png',
  'browserconfig.xml',
  'crossdomain.xml',
  'favicon.ico',
  'humans.txt',
  'manifest.json',
  'manifest.webapp',
  'robots.txt',
  'yandex-browser-manifest.json',
  relativePath + 'android-chrome-36x36.png',
  relativePath + 'android-chrome-48x48.png',
  relativePath + 'android-chrome-72x72.png',
  relativePath + 'android-chrome-96x96.png',
  relativePath + 'android-chrome-144x144.png',
  relativePath + 'android-chrome-192x192.png',
  relativePath + 'firefox_app_60x60.png',
  relativePath + 'firefox_app_128x128.png',
  relativePath + 'firefox_app_512x512.png',
  relativePath + 'mstile-70x70.png',
  relativePath + 'mstile-144x144.png',
  relativePath + 'mstile-150x150.png',
  relativePath + 'mstile-310x150.png',
  relativePath + 'mstile-310x310.png',
  relativePath + 'open-graph.png',
  relativePath + 'yandex-browser-50x50.png'
];


function checkFiles(directory, expectedFiles) {
  // Get the list of files from the specified directory
  const files = glob.sync('**/*', {
    'cwd': directory,
    'dot': true,      // include hidden files
    'mark': true      // add a `/` character to directory matches
  });

  // Check if all expected files are present in the
  // specified directory, and are of the expected type
  expectedFiles.forEach(file => {
    let ok = false;
    const expectedFileType = (file.slice(-1) !== '/' ? 'regular file' : 'directory');

    // If file exists
    if (files.indexOf(file) !== -1) {
      // Check if the file is of the correct type
      if (file.slice(-1) !== '/') {
        // Check if the file is really a regular file
        ok = fs.statSync(path.resolve(directory, file)).isFile();
      } else {
        // Check if the file is a directory
        // (Since glob adds the `/` character to directory matches,
        // we can simply check if the `/` character is present)
        ok = (files[files.indexOf(file)].slice(-1) === '/');
      }
    }

    it(`"${file}" should be present and it should be a ${expectedFileType}`, () => {
      assert.equal(true, ok);
    });
  });
}


(function runTests() {
  describe('Test if all the expected files, are present in the build directory', () => {
    describe(paths.dist, () => {
      checkFiles(paths.dist, expectedFilesInDistDir);
    });
  });
})();
