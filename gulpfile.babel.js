'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import mainBowerFiles from 'main-bower-files';
import del from 'del';
import runSequence from 'run-sequence';
import favicons from 'favicons';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import ngrok from 'ngrok';
import a11y from 'a11y';
import {output as pagespeed} from 'psi';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const bs = browserSync.create(pkg.name);
// Paths for all common dirs, change to fit your needs
const paths = {
  src: './src',
  dist: './dist'
};
paths.assets = {
  src: paths.src + '/assets',
  dist: paths.dist + '/assets'
};
paths.scripts = {
  src: paths.assets.src + '/scripts',
  dist: paths.assets.dist + '/scripts'
};
paths.styles = {
  src: paths.assets.src + '/styles',
  dist: paths.assets.dist + '/styles'
};
paths.media = {
  src: paths.assets.src + '/media',
  dist: paths.assets.dist + '/media'
};
paths.fonts = {
  src: paths.assets.src + '/fonts',
  dist: paths.assets.dist + '/fonts'
};
paths.sources = paths.assets.src + '/sources';
paths.favicons = paths.media.dist + '/favicons/';
const rootFavicons = [
  'manifest.json',
  'favicon.ico',
  'browserconfig.xml',
  'manifest.webapp',
  'yandex-browser-manifest.json',
  'apple-touch-icon.png'
].map(n => paths.favicons + n);
let tunnelUrl = '';

/**
 * Adds files to the output of mainBowerFiles()
 * @param  {array} filterGlobs Globs to filter main bower files
 * @param  {array} customFiles Array of cfiles to add
 * @return {array}             Result array of merge
 */
function customMainBowerFiles(filterGlobs, customFiles = []) {
  const a = mainBowerFiles(filterGlobs);
  return customFiles.concat(a);
}

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
  .pipe($.uglify())
  .pipe($.rename({
    suffix: '.min'
  }))
  .pipe($.sourcemaps.write('../maps'))
  .pipe(gulp.dest(paths.scripts.dist))
);

// Lint JavaScript
gulp.task('scripts:lint', () =>
  gulp.src([paths.scripts.src + '/*.js', `!${paths.scripts.src}/plugins.js`])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
);

// Generates plugins.js file
gulp.task('scripts:plugins', ['scripts:fonts', 'scripts:vendor'], () =>
  gulp.src(customMainBowerFiles([
    '**/*.js',
    '!**/jquery.js'
  ], [
    paths.scripts.src + '/plugins.js',
    paths.scripts.dist + '/vendor/typography.min.js'
  ]))
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
  gulp.src(customMainBowerFiles([
    '**/jquery.js'
  ], [
    paths.scripts.dist + '/vendor/modernizr.min.js'
  ]))
    .pipe($.if('!*.min.js', $.rename({ suffix: '.min' })))
    .pipe($.if('!*.min.js', $.uglify()))
    .pipe(gulp.dest(paths.scripts.dist + '/vendor'))
);


/**
 * Tasks for SASS
 */

// Copy external CSS dependencies
gulp.task('styles:copy', () =>
  gulp.src(mainBowerFiles('**/*.+(css|scss)'))
    .pipe($.if('*.css', $.rename({
      prefix: '_',
      extname: '.scss'
    })))
    .pipe(gulp.dest(paths.styles.src + '/vendors'))
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
    .pipe($.if(bs.active, bs.stream({ match: '**/*.css' })));
});


/**
 * Lossless compression for images (svg jpg jpeg gif svg)
 */

gulp.task('media', () =>
  gulp.src(customMainBowerFiles(['**/*.+(png|jpg|jpeg|gif|svg)'], [paths.media.src + '/**/*.+(png|jpg|jpeg|gif|svg)']))
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
  gulp.src(customMainBowerFiles(['**/*.+(ttf|otf|woff|woff2|eot|svg)'], [paths.fonts.src + '/*.+(ttf|otf|woff|woff2|eot|svg)']))
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
      iconsPath: paths.favicons.replace(paths.dist + '/', '')
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

// Copy to the root folder app
gulp.task('favicons:copy', () =>
  gulp.src(rootFavicons)
    .pipe(gulp.dest(paths.dist))
);

// Delete unnecessary and repeated files
gulp.task('favicons:trash', cb => {
  const copyArray = rootFavicons;
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
  $.watch([
    paths.media.dist + '/**/*',
    paths.fonts.dist + '/**/*',
    paths.dist + '/**/*.+(php|py|rb|js|html)'
  ], bs.reload);
});


/**
 * Watch files for changes and start their tasks
 */

gulp.task('watch', () => {
  $.watch([
    paths.scripts.src + '/**/*.js',
    `!${paths.scripts.src}/plugins.js`
  ], () => runSequence(['scripts']));
  $.watch(paths.scripts.src + '/plugins.js', () => runSequence(['scripts:plugins']));
  $.watch(paths.styles.src + '/**/*.+(css|scss|sass)', () => runSequence(['styles']));
  $.watch(paths.media.src + '/**/*.+(png|jpg|jpeg|gif|svg)', () => runSequence(['media']));
  $.watch(paths.fonts.src + '/**/*.+(ttf|otf|woff|woff2|eot|svg)', () => runSequence(['fonts']));
  $.watch(paths.sources + '/favicon.+(jpg|png)', () => runSequence(['favicons']));
  $.watch('./bower_components/**/*', () => runSequence([
    'scripts:plugins',
    'scripts:vendor',
    'styles:copy',
    'media',
    'fonts'
  ]));
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

// Create public tunnel to localhost, demo without deploying
gulp.task('tunnel-url', (cb) => {
  ngrok.connect(80, (err, url) => { // Change 80 to the port of your web server
    if (err) {
      $.util.log($.util.colors.red('gulp ngrok error: ' + err));
      return cb(err);
    }
    tunnelUrl = url + '/' + pkg.name + paths.dist.slice(1);
    $.util.log($.util.colors.blue('Serving your tunnel from: ' + tunnelUrl));
    cb();
  });
});

// PageSpeed Insights test for mobile
gulp.task('pagespeed-mobile', cb => {
  pagespeed(tunnelUrl, {
    strategy: 'mobile'
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// PageSpeed Insights test for desktop
gulp.task('pagespeed-desktop', cb => {
  pagespeed(tunnelUrl, {
    strategy: 'desktop'
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// Performance test
gulp.task('test:performance', cb => {
  runSequence('tunnel-url', 'pagespeed-mobile', 'pagespeed-desktop', cb);
});

// Accessibility test
gulp.task('test:accessibility', cb => {
  function displaySeverity(report) {
    let _return;
    if (report.severity === 'Severe') {
      _return = $.util.colors.red('[' + report.severity + '] ');
    } else if (report.severity === 'Warning') {
      _return = $.util.colors.yellow('[' + report.severity + '] ');
    } else {
      _return = '[' + report.severity + '] ';
    }
    return _return;
  }
  a11y('localhost/' + pkg.name + paths.dist.slice(1), (err, reports) => {
    if (err) {
      $.util.log($.util.colors.red('gulp a11y error: ' + err));
      return cb(err);
    }
    reports.audit.forEach((report) => {
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
