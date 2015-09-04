# Solid Webapp

[![Build Status](https://travis-ci.org/ramasilveyra/solid-webapp.svg?branch=master)](https://travis-ci.org/ramasilveyra/solid-webapp)
[![devDependency Status](https://david-dm.org/ramasilveyra/solid-webapp/dev-status.svg)](https://david-dm.org/ramasilveyra/solid-webapp#info=devDependencies)

Basic and solid boilerplate front-end for web apps.

## Quick start
1. Node.js and Git.
2. bower, gulp.js and eslint globally installed.
3. Clone the repo.
4. Run in node prompt `npm install --save-dev` and `bower install -S`.
5. Run `gulp` see the magic and start develop.

## Features

### CSS
* SASS and follow [Sass Guidelines](http://sass-guidelin.es/) structure
* SASS lint with scss-lint (BEM ready)
* CSS Autoprefixing
* Minify CSS with [clean-css](https://github.com/jakubpawlowicz/clean-css)
* Safely load external fonts to avoid FOIT
* Sourcemaps

### JavaScript
* ES6 ready with babelify
* Support for multiple bundles
* Source JS lint with eslint
* Minify with Uglify
* Sourcemaps

### Images
* Lossless compression of svg png jpg and gif
* Image sprite generator

### Tests
* Performance audit with PageSpeed Insights
* Accessibility audit with a11y
* Tests with mocha for Continuos Integration

### Other
* BrowserSync for synchronising URLs, interactions and code changes across multiple devices while develop
* Bower integration
* The gulpfile makes use of ES6 features by using Babel
* A custom Modernizr build for feature detection
* Automate Favicons generator for Home page icon and web app meta files for Android, iOS, Firefox, Windows 8.1, and Yandex Browser
* An optimized Google Analytics snippet

## Support
* IE9+
* Firefox latest
* Chrome latest
* Safari latest
* Opera latest
* BlackBerry 10+
* Android/Chrome 2.3+
* IE Mobile 10+

## Inspiration
* [HTML5 boilerplate](https://github.com/h5bp/html5-boilerplate)
* [Mobile HTML5 boilerplate](https://github.com/h5bp/mobile-boilerplate)
* [Web Starter Kit](https://github.com/google/web-starter-kit)
* [gulp-starter](https://github.com/greypants/gulp-starter)

## Documentation
Take a look at the [documentation page](docs/README.md).

## License
The code is available under the [MIT license](LICENSE.md).
