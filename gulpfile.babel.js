'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import fs from 'fs';
import del from 'del';
import favicons from 'favicons';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import babelify from 'babelify';
import ngrok from 'ngrok';
import a11y from 'a11y';
import {output as pagespeed} from 'psi';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const bs = browserSync.create(pkg.name);

// Paths for all common dirs
const src = './src';
const dist = './dist';
const assets = '/assets';
const paths = {
  src,
  dist,
  assets: {
    src: src + assets,
    dist: dist + assets
  },
  scripts: {
    src: src + assets + '/scripts',
    dist: dist + assets + '/scripts'
  },
  styles: {
    src: src + assets + '/styles',
    dist: dist + assets + '/styles'
  },
  media: {
    src: src + assets + '/media',
    dist: dist + assets + '/media'
  },
  fonts: {
    src: src + assets + '/fonts',
    dist: dist + assets + '/fonts'
  },
  sources:  src + assets + '/sources',
  favicons:  dist + assets + '/media/favicons/'
};


/**
 * Tasks for JS
 */

// browserify with babelify the JS code
gulp.task('scripts', ['scripts:lint'], () =>
  browserify({
    entries: paths.scripts.src + '/main.js',
    debug: true
  })
    .transform(babelify)
    .bundle()
  .pipe(source('main.js'))
  .pipe(buffer())
  .pipe($.sourcemaps.init({ loadMaps: true }))
  .pipe($.rename({
    suffix: '.min'
  }))
  .pipe($.sourcemaps.write('../maps'))
  .pipe(gulp.dest(paths.scripts.src))
);

// Lint JavaScript
gulp.task('scripts:lint', () =>
  gulp.src([paths.scripts.src + '/*.js', `!${paths.scripts.src}/plugins.js`])
    .pipe($.jshint())
    .pipe($.jscs({ esnext: true }))
    .on('error', () => {})
    .pipe($.jscsStylish.combineWithHintResults())
    .pipe($.jshint.reporter('jshint-stylish'))
);

// Generates plugins.js file
gulp.task('scripts:plugins', ['scripts:fonts', 'scripts:vendor'], () =>
  gulp.src([paths.scripts.src + '/plugins.js', paths.scripts.dist + '/vendor/typography.min.js'])
    .pipe($.if('!*.min.js', $.uglify()))
    .pipe($.concat('plugins.min.js'))
    .pipe(gulp.dest(paths.scripts.dist))
);

// Generate JS code to safelly load fonts to avoid FOIT
// Read: https://www.filamentgroup.com/lab/font-events.html
gulp.task('scripts:fonts', () =>
  gulp.src(paths.styles.dist + '/main.min.css')
    .pipe($.avoidfoit())
    .pipe($.rename({
      basename: 'typography',
      suffix: '.min',
      extname: '.js'
    }))
    .pipe($.uglify())
    .pipe(gulp.dest(paths.scripts.dist + '/vendor'))
);

// Copy external JS code
gulp.task('scripts:vendor', () =>
  gulp.src([
    './bower_components/jquery/dist/jquery.min.js',
    './bower_components/jquery/dist/jquery.min.map',
    paths.scripts.src + '/vendor/modernizr.min.js'
  ])
    .pipe(gulp.dest(paths.scripts.dist + '/vendor'))
);


/**
 * Tasks for SASS
 */

// Copy external CSS dependencies
gulp.task('styles:copy', () =>
  gulp.src(['./bower_components/normalize.css/normalize.css'])
    .pipe($.rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(paths.styles.src + '/vendor'))
);

// Compile SASS, prefix stylesheets, minfy and generate sourcemaps
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

  return gulp.src(paths.styles.src + '/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe($.if(bs.active, bs.stream()));
});


/**
 * Lossless compression for images (svg jpg jpeg gif svg)
 */

gulp.task('media', () =>
  gulp.src([paths.media.src + '/**/*.+(png|jpg|jpeg|gif|svg)'])
    .pipe($.if('/**/*.+(png|jpg|jpeg|gif|svg)', $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))))
    .pipe(gulp.dest(paths.media.dist))
);


/**
 * Move fonts to dist
 */

gulp.task('fonts', () =>
  gulp.src([paths.fonts.src + '/*.+(ttf|otf|woff|woff2|eot|svg|css)'])
    .pipe(gulp.dest(paths.fonts.dist))
);


/**
 * Favicons tasks
 */

// Generates all favicons images and files
gulp.task('favicons', cb => {
  favicons({
    files: {
      src: paths.sources + '/favicon.jpg',
      dest: paths.favicons,
      html: paths.dist + '/meta.html',
      iconsPath: 'assets/media/favicons/'
    },
    icons: {
      coast: false,
      appleStartup: false
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
  }, () => {
    runSequence('favicons:copy', 'favicons:trash', cb);
  });
});

// Vars used in 'favicons:copy' and 'favicons:trash' tasks
var rootFavicons = [
  'manifest.json',
  'favicon.ico',
  'browserconfig.xml',
  'manifest.webapp',
  'yandex-browser-manifest.json',
  'apple-touch-icon.png'
].map(n => paths.favicons + n);

// Copy to the root folder app
gulp.task('favicons:copy', () =>
  gulp.src(rootFavicons)
    .pipe(gulp.dest(paths.dist))
);

// Delete unnecessary and repeated files
gulp.task('favicons:trash', cb => {
  var copyArray = rootFavicons;
  copyArray.push(
    paths.favicons + 'apple-touch-icon*.png',
    paths.favicons + 'favicon-*.png',
    paths.dist + '/meta.html'
  );
  del(rootFavicons, cb);
});


/**
 * Start browserSync and start watch changes on dist folder for auto reload
 */

gulp.task('serve', () => {
  bs.init({
    proxy: 'localhost/',
    startPath: pkg.name + paths.dist.slice(1),
    logPrefix: pkg.name
  });
  gulp.watch([paths.dist + '/**/*'], bs.reload);
});


/**
 * Watch files for changes and start their tasks
 */

gulp.task('watch', () => {
  gulp.watch(paths.scripts.src + '/**/*.js', ['scripts']);
  gulp.watch(paths.scripts.src + '/plugins.js', ['scripts:plugins']);
  gulp.watch(paths.styles.src + '/**/*.+(css|scss|sass)', ['styles']);
  gulp.watch(paths.media.src + '/**/*.+(png|jpg|jpeg|gif|svg)', ['media']);
  gulp.watch(paths.fonts.src + '/**/*.+(ttf|otf|woff|woff2|eot|svg|css)', ['fonts']);
  gulp.watch(paths.sources + '/favicon.+(jpg|png)', ['favicons']);
});


/**
 * Build app
 */

gulp.task('build', cb => {
  runSequence('styles:copy', [
    'styles',
    'scripts',
    'scripts:plugins',
    'fonts',
    'media',
    'favicons'
  ], 'scripts:plugins', cb);
});


/**
 * Default task
 */

gulp.task('default', cb => {
  runSequence('build', 'serve', 'watch', cb);
});


/**
 * Test tasks
 */

// Create public tunnel to localhost without deploying
var site = '';
gulp.task('ngrok-url', (cb) => {
  ngrok.connect(80, (err, url) => { // Change 80 to the port of your Apache or nginx
    if (err) {
      throw err;
    }
    site = url + '/' + pkg.name + paths.dist.slice(1);
    console.log('Serving your tunnel from: ' + site);
    cb();
  });
});

// PageSpeed Insights test for mobile
gulp.task('pagespeed-mobile', cb => {
  pagespeed(site, {
    strategy: 'mobile',
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// PageSpeed Insights test for desktop
gulp.task('pagespeed-desktop', cb => {
  pagespeed(site, {
    strategy: 'desktop',
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// Performance test
gulp.task('test:performance', cb => {
  runSequence('ngrok-url', 'pagespeed-mobile', 'pagespeed-desktop', cb);
});

// Accessibility test
gulp.task('test:accessibility', cb => {
  function displaySeverity(report) {
    if (report.severity === 'Severe') {
      return $.util.colors.red('[' + report.severity + '] ');
    } else if (report.severity === 'Warning') {
      return $.util.colors.yellow('[' + report.severity + '] ');
    } else {
      return '[' + report.severity + '] ';
    }
  }
  a11y('localhost/' + pkg.name + paths.dist.slice(1), function (err, reports) {
    if (err) {
      $.util.log($.util.colors.red('gulp a11y error: ' + err));
      return;
    }
    reports.audit.forEach(function (report) {
      if (report.result === 'FAIL') {
        $.util.log(displaySeverity(report), $.util.colors.red(report.heading), report.elements);
      }
    });
    cb();
  });
});

// Run performance and accessibility tests
gulp.task('test', cb => {
  runSequence('test:performance', 'test:accessibility', 'scripts:lint', cb);
});
