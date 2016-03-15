'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
$.connect = require('gulp-connect');
$.autoprefixer = require('gulp-autoprefixer');
$.filter = require('gulp-filter');
$.useref = require('gulp-useref');
$.minifyCss = require('gulp-minify-css');
$.rev = require('gulp-rev');
$.revReplace = require('gulp-rev-replace');
$.insertLines = require('gulp-insert-lines');
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
// var maven = require('gulp-maven-deploy');
// var insertLines = require('gulp-insert-lines');

var paths = {
    app: 'app',
    styles: [ 'app/styles/*.css' ],
    dist: 'dist',
    index: 'app/index.html'
};

////////////////////////
// Reusable pipelines //
////////////////////////

var styles = lazypipe()
  // .pipe($.sass, {
  //   outputStyle: 'expanded',
  //   precision: 10
  // })
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////

gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [ './app', '.' ],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000
  });
});

gulp.task('runserver', [ 'start:server' ], function () {
  openURL('http://localhost:9000');
});

gulp.task('watch', function () {
    $.watch('.')
    .pipe($.connect.reload());
});

///////////
// Build //
///////////

gulp.task('clean:dist', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

gulp.task('client:build', ['styles'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets = $.useref.assets({searchPath: [paths.app, '.tmp']});

  return gulp.src(paths.index)
    .pipe(assets)
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))
    .pipe(cssFilter.restore())
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.revReplace())
    .pipe($.useref())
    .pipe($.insertLines({
      'after': /<!-- forDist : DO NOT REMOVE : insertion point for dist only -->$/,
      'lineAfter': '<script>L.Icon.Default.imagePath = "/scripts/images";</script>'
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('copy:extras', function () {
  return gulp.src(paths.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(paths.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(paths.app + '/../bower_components/bootstrap/fonts/**/*')
    .pipe(gulp.dest(paths.dist + '/fonts'));
})

gulp.task('copy:leafletImages', function () {
  return gulp.src(paths.app + '/../bower_components/leaflet-dist/images/**/*')
    .pipe(gulp.dest(paths.dist + '/scripts/images'));
})

gulp.task('copy:data', function() {
  return gulp.src(paths.app + '/data/**/*')
    .pipe(gulp.dest(paths.dist + '/data'));
});

gulp.task('copy:template', function() {
  return gulp.src(paths.app + '/template/**/*')
    .pipe(gulp.dest(paths.dist + '/template'));
});

gulp.task('build', ['clean:tmp', 'clean:dist'], function (cb) {
  runSequence([
    'copy:leafletImages',
    'copy:template',
    'copy:data',
    // 'copy:extras',
    'copy:fonts',
    'client:build'], cb);
});