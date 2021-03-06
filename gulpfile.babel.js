import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import sprity from 'sprity';
import a11y from 'a11y';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import partialImport from 'postcss-partial-import';
import reporter from 'postcss-reporter';
import cssnext from 'postcss-cssnext';
import stylelint from 'stylelint';
import { assign } from 'lodash';
import { output as pagespeed } from 'psi';
import { paths, bundles } from './config.js';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const bs = browserSync.create(pkg.name);
const rootFavicons = [
  'manifest.json',
  'favicon.ico',
  'browserconfig.xml',
  'manifest.webapp',
  'yandex-browser-manifest.json',
  'apple-touch-icon.png'
].map(n => paths.favicons + n);
let tunnelUrl = '';
let isWatchify = false;

/**
 * Tasks for JS
 */

// browserify with babelify the JS code, and watchify

const createBundle = options => {
  const opts = assign({}, watchify.args, {
    entries: options.entries,
    extensions: options.extensions,
    debug: true
  });

  let b = browserify(opts);
  b.transform(babelify.configure({
    compact: false
  }));

  const rebundle = () =>
    b.bundle()
    // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(options.output))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(options.destination));

  if (isWatchify) {
    b = watchify(b);
    b.on('update', rebundle);
    b.on('log', $.util.log);
  }

  return rebundle();
};

gulp.task('scripts', ['scripts:lint'], () =>
  bundles.forEach(bundle =>
    createBundle({
      entries: bundle.entries,
      output: bundle.output,
      extensions: bundle.extensions,
      destination: bundle.destination
    })
  )
);


// Lint JavaScript
gulp.task('scripts:lint', () =>
  gulp.src([
    `${paths.src}/**/*.+(jsx|js)`,
    `!${paths.scripts.src}/vendors/*.js`
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
);


/**
 * Tasks for CSS
 */

// Compile CSS, prefix stylesheets, minfy and generate sourcemaps
gulp.task('styles', ['styles:lint'], () =>
  gulp.src(`${paths.styles.src}/*.css`)
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      partialImport,
      cssnext
    ]))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe($.if(bs.active, bs.stream({ match: '**/*.css' })))
);

// Lint CSS files
gulp.task('styles:lint', () =>
  gulp.src([
    `${paths.styles.src}/**/*.css`,
    `!${paths.styles.src}/vendors/*`
  ])
    .pipe($.postcss([
      stylelint(),
      reporter({ clearMessages: true })
    ]))
);


/**
 * Sprites and Lossless compression for images (svg jpg jpeg gif svg)
 */

gulp.task('media', () =>
  gulp.src([
    `${paths.media.src}/**/*.+(png|jpg|jpeg|gif|svg)`,
    `!${paths.media.src}/sprite-images/**/*.{png,jpg}`
  ])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 7,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{ cleanupIDs: false }]
    })))
    .pipe(gulp.dest(paths.media.dist))
);


// generate sprite.png and _sprite.scss
gulp.task('sprite:images', () =>
  sprity.src({
    src: `${paths.media.src}/sprite-images/**/*.{png,jpg}`,
    style: './sprite.css',
    processor: 'sass'
  })
  .pipe($.if(
    '*.png',
    gulp.dest(paths.media.dist),
    gulp.dest(`${paths.styles.src}/vendors`)
  ))
);

/**
 * Move fonts to dist
 */

gulp.task('fonts', () =>
  gulp.src([
    `${paths.fonts.src}/*.+(ttf|otf|woff|woff2|eot|svg)`
  ])
    .pipe(gulp.dest(paths.fonts.dist))
);


/**
 * Favicons tasks
 */

gulp.task('favicons', cb => {
  runSequence('favicons:generator', 'favicons:copy', 'favicons:trash', cb);
});

// Generates all favicons images and files
gulp.task('favicons:generator', () =>
  gulp.src(`${paths.sources}/favicon.jpg`)
    .pipe($.favicons({
      appName: pkg.name,
      appDescription: pkg.description,
      developerName: pkg.author.name,
      developerURL: pkg.author.url,
      background: '#ffffff',
      path: paths.favicons.replace(`${paths.dist}/`, ''),
      url: pkg.homepage,
      display: 'standalone',
      orientation: 'portrait',
      version: pkg.version,
      logging: false,
      online: false,
      icons: {
        appleStartup: false,
        coast: false,
        windows: false
      }
    }))
    .pipe(gulp.dest(paths.favicons))
);

// Copy to the root folder app
gulp.task('favicons:copy', () =>
  gulp.src(rootFavicons)
    .pipe(gulp.dest(paths.dist))
);

// Delete unnecessary and repeated files
gulp.task('favicons:trash', cb => {
  const copyArray = rootFavicons;
  copyArray.push(
    `${paths.favicons}apple-touch-icon*.png`,
    `${paths.favicons}favicon-*.png`,
    `${paths.dist}/meta.html`
  );
  del(rootFavicons).then(() => cb());
});


/**
 * Browsersync
 */

// Start Browsersync and start watch changes on dist folder for auto reload
gulp.task('serve', () => {
  bs.init({
    proxy: 'localhost/',
    startPath: pkg.name + paths.dist.slice(1),
    logPrefix: pkg.name,
    online: false
  });
  $.watch([
    `${paths.media.dist}/**/*`,
    `${paths.fonts.dist}/**/*`,
    `${paths.dist}/**/*.+(php|py|rb|js|html)`
  ], bs.reload);
});

// Generate secure tunnnel to your localhost
gulp.task('serve:tunnel', () => {
  const bsTunnel = browserSync.create(`${pkg.name}-tunnel`);
  bsTunnel.init({
    proxy: 'localhost/',
    startPath: pkg.name + paths.dist.slice(1),
    logPrefix: `${pkg.name}-tunnel`,
    tunnel: true,
    online: true,
    open: 'tunnel'
  }, (err, _bs) => {
    tunnelUrl = _bs.tunnel.url + pkg.name + paths.dist.slice(1);
  });
});


/**
 * Watch files for changes and start their tasks
 */

gulp.task('watch', () => {
  isWatchify = true;
  runSequence(['scripts']);
  $.watch(`${paths.styles.src}/**/*.+(css|scss|sass)`, () =>
    runSequence(['styles'])
  );
  $.watch(`${paths.media.src}/**/*.+(png|jpg|jpeg|gif|svg)`, () =>
    runSequence(['media'])
  );
  $.watch(`${paths.media.src}/sprite-images/**/*.{png,jpg}`, () =>
    runSequence(['sprite:images'])
  );
  $.watch(`${paths.fonts.src}/**/*.+(ttf|otf|woff|woff2|eot|svg)`, () =>
    runSequence(['fonts'])
  );
  $.watch(`${paths.sources}/favicon.+(jpg|png)`, () =>
    runSequence(['favicons'])
  );
});


/**
 * Build app
 */

gulp.task('build', cb => {
  runSequence(['styles', 'scripts', 'fonts', 'media', 'favicons'], cb);
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
  runSequence('serve:tunnel', 'pagespeed-mobile', 'pagespeed-desktop', cb);
});

// Accessibility test
gulp.task('test:accessibility', cb => {
  function displaySeverity(report) {
    let _return;
    if (report.severity === 'Severe') {
      _return = $.util.colors.red(`[${report.severity}] `);
    } else if (report.severity === 'Warning') {
      _return = $.util.colors.yellow(`[${report.severity}] `);
    } else {
      _return = `[${report.severity}] `;
    }
    return _return;
  }
  a11y(`localhost/${pkg.name}${paths.dist.slice(1)}`, (err, reports) => {
    if (err) {
      $.util.log($.util.colors.red(`gulp a11y error: ${err}`));
      return cb(err);
    }
    reports.audit.forEach((report) => {
      if (report.result === 'FAIL') {
        $.util.log(
          displaySeverity(report),
          $.util.colors.red(report.heading),
          report.elements
        );
      }
    });
    cb();
  });
});

// Run performance and accessibility tests
gulp.task('test', cb => {
  runSequence('test:performance', 'test:accessibility', 'scripts:lint', cb);
});
