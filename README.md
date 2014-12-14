Solid Webapp
============

Basic and solid Development and Production enviroment and file structured for web projects based on LEMP/LAMP stack.

## Quick start
1) LEMP/LAMP stack runnig.
2) Node.js and Git.
3) bower and gulp.js globally installed.
4) Download the latest stable release of Solid Webapp.
4) Run in node prompt `npm install --save-dev gulp browser-sync gulp-load-plugins run-sequence gulp-jshint gulp-uglify gulp-concat gulp-csso gulp-imagemin gulp-watch` and `bower install --save jquery modernizr normalize.css`.
5) Run `gulp` see the magic and start develop. 

## Development enviroment
The development enviroment is all the content of _assets/ is the raw code before minification or concatenation or some other compilation. The CSS and JS files are concatenated and minified, and the images are lossless compressed via gulp.js to the Production enviroment in dist/assets/.

## Production enviroment
The production enviroment is all the content of dist/ folder, is the webapp/website ready for upload.

## Folder structure

* bower_components/:
* _assets/: Source files for everything used by the front-end, this includes all public asset files. 
    * css/: For all CSS files.
    * js/: For all JS files.
    * font/: For all fonts (.svg, .woff, .woff2, .otf, .ttf).
    * media/: For all images and video files.
* dist/: This is your webapp ready for upload or test in the develop process. Remember that this directory is generated via gulp.js.
* docs/: This directory contains documentation.
* node_modules/:
* dist/: This is the directory for develop your webapp.
  * app/: This directory contains your application. Inside this folder create the folder structure according to your design pattern (MVC, MVVM, MVP or a modular approach).
  * assets/: This includes all public asset files. Everything used by the front-end.
    * css/: For all CSS files.
    * js/: For all JS files.
    * font/: For all fonts (.svg, .woff, .woff2, .otf, .ttf).
    * media/: For all images and video files.
  * data/: This directory provides a place to store application data that is volatile and possibly temporary. 
    * cache/: For cache files.
    * logs/: For logs files.
    * sessions/: For session files.
    * uploads/: For uploads files.
  * lib/: This directory is for common libraries on which the back-end application depends.
  * workers/: This directory contains maintenance and/or build scripts. Such scripts might include command line, cron, or phing build scripts that are not executed at runtime but are part of the correct functioning of the application.
* tests/: This directory contains application tests.