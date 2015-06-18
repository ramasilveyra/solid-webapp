'use strict';

import del from 'del';
import browserSync from 'browser-sync';
import fs from 'fs';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();
var bs = browserSync.create(pkg.name);


/**
 * Valida, minifica, y concatena los archivos JavaScript
 */

gulp.task('scripts', () =>
  gulp.src(['./src/assets/scripts/main.js'])
    .pipe($.sourcemaps.init())
    .pipe($.jshint())
    .pipe($.jscs())
    // Metete el error de node/io en el culo si hay algo mal en mi js. Solo quiero una advertencia.
    .on('error', () => {})
    .pipe($.jscsStylish.combineWithHintResults())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.uglify())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest('./dist/assets/scripts'))
);

gulp.task('scripts:plugins', ['scripts:fonts'], () =>
  gulp.src(['./src/assets/scripts/plugins.js', './dist/assets/scripts/vendor/typography.min.js'])
    .pipe($.if('!*.min.js', $.uglify()))
    .pipe($.concat('plugins.min.js'))
    .pipe(gulp.dest('./dist/assets/scripts'))
);

gulp.task('scripts:vendor', () =>
  gulp.src(['./bower_components/jquery/dist/jquery.min.js', './bower_components/jquery/dist/jquery.min.map', './src/assets/scripts/vendor/modernizr.min.js'])
    .pipe(gulp.dest('./dist/assets/scripts/vendor'))
);

gulp.task('scripts:fonts', () =>
  gulp.src('./dist/assets/styles/main.min.css')
    .pipe($.avoidfoit())
    .pipe($.rename({
      basename: 'typography',
      suffix: '.min',
      extname: '.js'
    }))
    .pipe($.uglify())
    .pipe(gulp.dest('./dist/assets/scripts/vendor'))
);


/**
 * Compila SASS, valida, minifica, y concatena los archivos CSS
 */

gulp.task('styles:copy', () =>
  gulp.src(['./bower_components/normalize.css/normalize.css'])
    .pipe($.rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest('./src/assets/styles/vendors'))
);

gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
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

  return gulp.src('./src/assets/styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.sourcemaps.write('../maps'))
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('./dist/assets/styles'))
    .pipe($.if(bs.active, bs.stream()));
});


/**
 * Comprime imagenes
 */

gulp.task('media', () =>
  gulp.src(['./src/assets/media/**/*.+(png|jpg|jpeg|gif|svg)'])
    .pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('./dist/assets/media'))
);


/**
 * Genera las fuentes web a partir de .ttf o .otf
 */

gulp.task('fonts', () =>
  /*
   * gulp-fontgen solo esta probado en OS X
   *
  gulp.src(['./src/assets/fonts/*.+(ttf|otf)'])
    .pipe($.fontgen({
      dest: './dist/fonts/'
    }))
  */
  gulp.src(['./src/assets/fonts/*.+(ttf|otf|woff|woff2|eot|svg|css)'])
    .pipe(gulp.dest('./dist/assets/fonts'))
);


/**
 * Genera los favicons
 */
gulp.task('favicons', cb =>
  fs.writeFile('./dist/meta.html', '<html><head></head></html>', error => {
    if (error) {
      return cb(error);
    }
    runSequence('favicons:generate', 'favicons:copy', 'favicons:trash', cb);
  })
);

gulp.task('favicons:generate', () =>
  gulp.src('./dist/meta.html') // Pequeño hack para que no inserte HTML
    .pipe($.favicons({
      files: {
        src: './src/assets/sources/favicon.jpg',
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
    .pipe(gulp.dest('./dist/'))
);

// Variables usadas por 'favicons:copy' y 'favicons:trash'
var pathRootFavicons =  './dist/assets/media/favicons/';
var rootFavicons = ['manifest.json', 'favicon.ico', 'browserconfig.xml', 'manifest.webapp', 'yandex-browser-manifest.json', 'apple-touch-icon.png'].map(n => pathRootFavicons + n);

gulp.task('favicons:copy', () =>
  gulp.src(rootFavicons)
    .pipe(gulp.dest('./dist/'))
);

gulp.task('favicons:trash', cb => {
  var copyArray = rootFavicons;
  copyArray.push(`${pathRootFavicons}apple-touch-icon*.png`, `${pathRootFavicons}favicon-*.png`, `./dist/meta.html`);
  del(copyArray, cb);
});


/**
 * Inicia browserSync y comienza a vigilar los archivos para recargar página
 */

gulp.task('serve', () => {
  bs.init({
    proxy: 'localhost/',
    startPath: `${pkg.name}/dist/`,
    logPrefix: pkg.name
  });
  gulp.watch(['./dist/assets/scripts/*.js', './dist/assets/media/**/*', './dist/assets/fonts/**/*', './dist/**/*.+(php|html)'], bs.reload);
});


/**
 * Comienza a vigilar los archivos para realizar sus corespondientes tareas
 */

gulp.task('watch', () => {
  gulp.watch('./src/assets/scripts/main.js', ['scripts']);
  gulp.watch('./src/assets/scripts/plugins.js', ['scripts:plugins']);
  gulp.watch('./src/assets/styles/**/*.+(css|scss|sass)', ['styles']);
  gulp.watch('./src/assets/media/**/*.+(png|jpg|jpeg|gif|svg)', ['media']);
  gulp.watch('./src/assets/fonts/**/*.+(ttf|otf|woff|woff2|eot|svg|css)', ['fonts']);
  gulp.watch('./src/assets/sources/favicon.+(jpg|png)', ['favicons']);
});


/**
 * Construye la app
 */

gulp.task('build', cb => {
  runSequence('styles:copy', ['styles', 'scripts', 'scripts:vendor', 'fonts', 'media', 'favicons'], 'scripts:plugins', cb);
});


/**
 * Tarea por defecto
 */

gulp.task('default', cb => {
  runSequence('build', 'serve', 'watch', cb);
});
