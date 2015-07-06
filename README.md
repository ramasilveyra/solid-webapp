# Solid Webapp

Basic and solid Development and Production enviroment and file structured for web projects based on LEMP/LAMP stack.

## Quick start
1. LEMP/LAMP stack runnig.
2. Node.js and Git.
3. bower, gulp.js, JSCS and JSHint globally installed.
4. Clone the repo.
5. Run in node prompt `npm install --save-dev` and `bower install -S`.
6. Run `gulp` see the magic and start develop.

## Features
### CSS
* SASS and follow [Sass Guidelines](http://sass-guidelin.es/) structure
* BEM ready
* CSS Autoprefixing
* Minify CSS with [clean-css](https://github.com/jakubpawlowicz/clean-css)
* Safely load external fonts to avoid FOIT
* Sourcemaps
### JavaScript
* ES6 ready with babelfy
* Source JS lint with JSCS and JSHint
* Minify with Uglify
* Sourcemaps
### Images
* Lossless compression of svg png jpg and gif
### Tests
* Performance audit with PageSpeed Insights
* Accessibility audit with a11y
### Other
* BrowserSync for synchronising URLs, interactions and code changes across multiple devices while develop
* The gulpfile makes use of ES6 features by using Babel
* A custom Modernizr build for feature detection and a polyfill for CSS Media Queries.
* Automate Favicons generator for Home page icon for Android, iOS, Nokia, Firefox, Windows, Yandex Browser
* An optimized Google Analytics snippet

## Support
* IE9+, IE Mobile 10+
* Firefox latest
* Chrome latest
* Safari latest
* Opera latest
* BlackBerry 10+
* Android/Chrome 2.3+

## Inspiration
* [HTML5 boilerplate](https://github.com/h5bp/html5-boilerplate)
* [Mobile HTML5 boilerplate](https://github.com/h5bp/mobile-boilerplate)
* [Web Starter Kit](https://github.com/google/web-starter-kit)
* [gulp-starter](https://github.com/greypants/gulp-starter)

## License
The code is available under the [MIT license](https://github.com/ramasilveyra/solid-webapp/blob/master/LICENSE.md).