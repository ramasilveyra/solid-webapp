'use strict';

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    pkg = require('./package.json'),
    runSequence = require('run-sequence'),
    fs = require('fs'),
    del = require('del');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 30',
  'safari >= 5',
  'opera >= 12.1',
  'ios >= 6',
  'android >= 2.3',
  'bb >= 10'
];

/**
 * Valida, minifica, y concatena los archivos JavaScript
 */

gulp.task('js', function() {
  return gulp.src(['./_assets/scripts/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.uglify())
    .pipe(plugins.concat('main.min.js'))
    .pipe(gulp.dest('./dist/assets/scripts'));
});

gulp.task('js:lib-concat', function() {
  return gulp.src(['./dist/assets/scripts/main.min.js', './bower_components/modernizr/modernizr.js'])
    .pipe(plugins.concat('main.min.js'))
    .pipe(plugins.if('!*.min.js', plugins.uglify()))
    .pipe(gulp.dest('./dist/assets/scripts'));
});

gulp.task('js:lib-sep', function() {
  return gulp.src(['./bower_components/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('./dist/assets/scripts/vendor'));
});

gulp.task('js:fonts', function() {
  return gulp.src('./dist/assets/styles/main.min.css')
    .pipe(plugins.avoidfoit())
    .pipe(plugins.rename({
      basename: 'typography',
      extname: '.js'
    }))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('./dist/assets/scripts/vendor'));
});


/**
 * Compila SASS, valida, minifica, y concatena los archivos CSS
 */

gulp.task('css:copy', function() {
  return gulp.src(['./bower_components/normalize.css/normalize.css'])
    .pipe(plugins.rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest('./_assets/styles/vendors'));
});

gulp.task('css', function() {
  return gulp.src('./_assets/styles/main.scss')
    .pipe(plugins.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(plugins.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(plugins.csso())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/styles'))
    .pipe(reload({stream:true}));
});

/**
 * Comprime imagenes
 */

gulp.task('images', function() {
  return gulp.src(['./_assets/media/**/*.+(png|jpg|jpeg|gif|svg)'])
    .pipe(plugins.imagemin({
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest('./dist/assets/media'));
});

/**
 * Genera las fuentes web a partir de .ttf o .otf
 */

gulp.task('fonts', function () {
  /*
   * gulp-fontgen solo esta probado en OS X
   *
  return gulp.src(['./_assets/fonts/*.+(ttf|otf)'])
    .pipe(plugins.fontgen({
      dest: './dist/fonts/'
    }));
  */
  return gulp.src(['./_assets/fonts/*.+(ttf|otf|woff|woff2|eot|svg|css)'])
    .pipe(gulp.dest('./dist/assets/fonts'));
});

/**
 * Genera los favicons
 */
gulp.task('favicons', function () {
  return fs.writeFile('./dist/meta.html', '<html><head></head></html>', function(err) {
    err ? console.log(err) : runSequence('favicons:generate', 'favicons:copy', 'favicons:trash');
  });
});

gulp.task('favicons:generate', function () {
  return gulp.src('./dist/meta.html') // Pequeño hack para que no inserte HTML
    .pipe(plugins.favicons({
      files: {
        src: './_assets/sources/favicon.jpg',
        dest: 'assets/media/favicons/',
        iconsPath: 'assets/media/favicons/'
      },
      icons: {
        appleStartup: false,
        coast: false
      },
      settings: {
        appName: pkg.name,
        appDescription: pkg.description,
        developer: pkg.author.name,
        developerURL: pkg.author.url,
        version: pkg.version,
        background: '#ffffff',
        url: pkg.homepage
      }
    }))
    .pipe(gulp.dest('./dist/'));
});

// Variables usadas por 'favicons:copy' y 'favicons:trash'
var pathRootFavicons =  './dist/assets/media/favicons/';
var rootFavicons = ['manifest.json', 'favicon.ico', 'browserconfig.xml', 'manifest.webapp', 'yandex-browser-manifest.json', 'apple-touch-icon.png'];
rootFavicons.forEach(function (element, index, array) {
  array[index] = pathRootFavicons + element;
});

gulp.task('favicons:copy', function () {
  return gulp.src(rootFavicons)
    .pipe(gulp.dest('./dist/'));
});

gulp.task('favicons:trash', function (done) {
  var copyArray = rootFavicons;
  copyArray.push(pathRootFavicons + 'apple-touch-icon*.png', pathRootFavicons + 'favicon-*.png','./dist/meta.html');
  del(copyArray, done);
});

/**
 * Inicia browserSync y comienza a vigilar los archivos
 */

gulp.task('serve', function() {
  if (!browserSync.active) {
    browserSync({
      proxy: 'localhost/',
      startPath: pkg.name + '/dist/',
      logPrefix: pkg.name
    });
  }
});

/**
 * Actualiza los navegadores conectados a browserSync
 */

gulp.task('serve:reload', function () {
  return reload();
});


/**
 * Inicia browserSync y comienza a vigilar los archivos
 */

gulp.task('watch', function () {
  plugins.watch('./_assets/scripts/**/*.js', function () {
    runSequence('js', 'js:lib-concat', 'serve:reload');
  });
  plugins.watch('./_assets/styles/**/*.+(css|scss|sass)', function () {
    runSequence('css');
  });
  plugins.watch('./_assets/media/**/*.+(png|jpg|jpeg|gif|svg)', function () {
    runSequence('images', 'serve:reload');
  });
  plugins.watch('./_assets/fonts/**/*.+(ttf|otf|woff|woff2|eot|svg|css)', function () {
    runSequence('fonts', 'serve:reload');
  });
  plugins.watch(['./dist/**/*.+(php|html)'], function () {
    runSequence('serve:reload');
  });
  plugins.watch(['./dist/assets/styles/main.min.css'], function () {
    runSequence('js:fonts');
  });
});

/**
 * Construye la app
 */

gulp.task('build', function() {
  runSequence('css:copy', ['css', 'js', 'js:lib-sep', 'fonts', 'images', 'favicons'], 'js:lib-concat');
});

/**
 * Tarea por defecto
 */

gulp.task('default', function() {
  runSequence('build', 'serve', 'watch');
});