'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
// var maven = require('gulp-maven-deploy');

var paths = {
    app: 'app',
    styles: [ 'app/styles/*.css' ],
    scripts: [ 'app/react/*.js' ],
    dist: 'dist',
    tmp: '.tmp',
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

var reactify = lazypipe()
  .pipe($.babel, { presets: [ 'react' ] })
  .pipe(gulp.dest, './.tmp/react');

var scripts = lazypipe()
  .pipe($.browserify)
  .pipe($.rename, 'geotags.js')
  .pipe(gulp.dest, './.tmp/js');

///////////
// Tasks //
///////////

gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [ './app', './.tmp', '.' ],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000
  });
});

gulp.task('start:client', function () {
  openURL('http://localhost:9000/index.html');
});

gulp.task('runserver', function(cb) {
  runSequence(
    'clean:tmp',
    'scripts',
    'start:server',
    'start:client',
    'watch',
    cb);
});

gulp.task('watch', function (cb) {

    gulp.src(paths.scripts)
    .pipe($.plumber())
    .pipe($.watch(paths.scripts))
    .pipe(reactify());

    $.watch('./.tmp/react/*.js', function() {
      gulp.src('./.tmp/react/main.js')
      .pipe($.plumber())
      .pipe(scripts());
    });

    gulp.src('./.tmp/js/*.js')
    .pipe($.watch('./.tmp/js/*.js'))
    .pipe($.connect.reload());

    cb();

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

gulp.task('clean:all', ['clean:dist', 'clean:tmp']);

gulp.task('scripts:reactify', [ 'clean:tmp' ], function() {
  return gulp.src(paths.scripts)
    .pipe(reactify());
})

gulp.task('scripts', [ 'scripts:reactify' ], function() {
  return gulp.src('./.tmp/react/main.js')
    .pipe(scripts());
});

gulp.task('client:build', ['styles','scripts'], function () {
  // var jsFilter = $.filter('**/*.js', {restore: true, passthrough: false});
  // var cssFilter = $.filter('**/*.css', {restore: true, passthrough: false});

  return gulp.src(paths.index)
    .pipe($.useref())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe($.if('*.js', $.rev()))
    .pipe($.if('*.css', $.rev()))
    .pipe($.if('index.html', $.revReplace()))
    .pipe($.if('index.html', $.insertLines({
      'after': /<!-- forDist : DO NOT REMOVE : insertion point for dist only -->$/,
      'lineAfter': '<script>L.Icon.Default.imagePath = "/scripts/images";</script>'
    })))
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
