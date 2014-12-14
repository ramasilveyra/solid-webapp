"use strict";

var gulp = require("gulp"),
    plugins = require("gulp-load-plugins")(),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    pkg = require("./package.json"),
    runSequence = require("run-sequence");

/*
 * Valida, minifica, y concatena los archivos JavaScript
 */

gulp.task("js", function() {
  return gulp.src("_assets/js/*.js")
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter("default"))
    .pipe(plugins.uglify())
    .pipe(plugins.concat("main.min.js"))
    .pipe(gulp.dest("dist/assets/js"));
});

gulp.task("js-lib", function() {
  return gulp.src(["bower_components/jquery/dist/jquery.min.js","bower_components/modernizr/modernizr.js"])
    .pipe(plugins.uglify())
    .pipe(gulp.dest("dist/assets/js/vendor"));
});

/*
 * Valida, minifica, y concatena los archivos CSS
 */

gulp.task("css", function() {
  return gulp.src(["bower_components/normalize.css/normalize.css","_assets/css/*.css"])
    .pipe(plugins.csso())
    .pipe(plugins.concat("main.min.css"))
    .pipe(gulp.dest("dist/assets/css"))
    .pipe(reload({stream:true}));
});

/*
 * Comprime imagenes
 */

gulp.task("images", function() {
  return gulp.src(["_assets/media/*.+(png|jpg|jpeg|gif|svg)"])
    .pipe(plugins.imagemin({
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest("dist/assets/media"));
});

/*
 * Actualiza los navegadores conectados a browserSync
 */

gulp.task("serve:reload", function() {
  return reload();
});

function multiTask( listTask ) {
  var taskName = "multi-" + listTask.join("-");
  gulp.task(taskName, listTask, function() {
    runSequence(["serve:reload"]);
  });
  runSequence([taskName]);
}

/*
 * Inicia browserSync y comienza a vigilar los archivos
 */

gulp.task("serve", function() {
  browserSync({
    proxy: "http://localhost/" + pkg.name + "/dist/"
  }, function (err, bs) {
    multiTask(["js", "js-lib", "css", "images"]);
  });
  plugins.watch("_assets/js/**/*.js", function () {
    multiTask(["js"]);
  });
  plugins.watch("_assets/css/**/*.css", function () {
    runSequence(["css"]);
  });
  plugins.watch("_assets/media/**/*.+(png|jpg|jpeg|gif|svg)", function () {
    multiTask(["images"]);
  });
  plugins.watch(["dist/**/*.+(php|html)", "dist/assets/font/**/*.*", "dist/assets/media/**/*.*"], function () {
    runSequence(["serve:reload"]);
  });
});

gulp.task("default", ["serve"]);