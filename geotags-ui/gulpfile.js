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
    styles: [ 'app/styles/**/*.css' ],
    components: [ 'app/react/**/*.js' ],
    scripts: [ '.tmp/react/geotags.js', '.tmp/react/login.js' ],
    dist: 'dist',
    tmp: '.tmp',
    main: [ 'app/geotags.html', 'app/login.html'],
    templates: [ ]
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

var scripts = lazypipe()
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/scripts');

var reactify = lazypipe()
  .pipe($.babel, { presets: [ 'react' ] })
  .pipe(gulp.dest, './.tmp/react');

var browserify = lazypipe()
  .pipe($.browserify)
  // .pipe($.rename, 'geotags.js')
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
  openURL('http://localhost:9000/login.html');
});

gulp.task('runserver', function(cb) {
  runSequence(
    'clean:tmp',
    'scripts',
    'styles',
    'start:server',
    'start:client',
    'watch',
    cb);
});

gulp.task('watch', function (cb) {

  gulp.src(paths.styles)
  .pipe($.watch(paths.styles))
  .pipe($.connect.reload());

  gulp.src(paths.components)
  .pipe($.plumber())
  .pipe($.watch(paths.components))
  .pipe($.if('config/layers.js', $.replace(/{GPP_API_KEY}/, process.env.GPP_API_KEY || 'SECRET')))
  .pipe(reactify());

  $.watch('./.tmp/react/**/*.js', function() {
    gulp.src(paths.scripts)
    .pipe($.plumber())
    .pipe(browserify());
  });

  gulp.src('./.tmp/js/**/*.js')
  .pipe($.watch('./.tmp/js/**/*.js'))
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
  return gulp.src(paths.components)
    .pipe($.if('config/layers.js', $.replace(/{GPP_API_KEY}/, process.env.GPP_API_KEY || 'SECRET')))
    .pipe(reactify());
})

gulp.task('scripts', [ 'scripts:reactify' ], function() {
  return gulp.src(paths.scripts)
    .pipe(browserify());
});

gulp.task('client:build:main', [ 'scripts', 'styles' ], function () {

  return gulp.src(paths.main)
  .pipe($.useref())
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.js', $.rev()))
  .pipe($.if('*.css', $.cleanCss()))
  .pipe($.if('*.css', $.rev()))
  .pipe($.if('*.html', $.replace(/<\!-- remove -->(.|\s)*?<\!-- endremove -->/g, '<!-- (snip) -->')))
  .pipe($.if('*.html', $.replace(/<\!--\+\+ ((.|\s)*?) \+\+-->/g, '$1')))
  .pipe($.revReplace())
  .pipe(gulp.dest(paths.dist))
  .pipe($.rev.manifest())
  .pipe(gulp.dest(paths.dist));

});

gulp.task('client:build', [ 'client:build:main' ], function () {

  var manifest = gulp.src("./" + paths.dist + "/rev-manifest.json");
  
  return gulp.src(paths.templates)
  .pipe($.replace(/<\!-- remove -->(.|\s)*?<\!-- endremove -->/g, '<!-- (snip) -->'))
  .pipe($.replace(/<\!--\+\+ ((.|\s)*?) \+\+-->/g, '$1'))
  .pipe($.revReplace({ manifest: manifest }))
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

gulp.task('copy:images', function() {
  return gulp.src(paths.app + '/images/**/*')
    .pipe(gulp.dest(paths.dist + '/images'));
});

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
    'copy:images',
    // 'copy:extras',
    'copy:fonts',
    'client:build'], cb);
});
