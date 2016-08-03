'use strict';

var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  del = require('del'),
  install = require('gulp-install'),
  merge = require('merge-stream'),
  zip = require('gulp-zip'),
  awsLambda = require('node-aws-lambda'),
  runSequence = require('run-sequence')
;

gulp.task('watch', function () {
  nodemon({
    script: 'www/server.js',
    watch: ['www/*', 'config/*', 'services/*', 'skill/*'],
    ext: 'json js',
    ignore: ['node_modules/**/*'],
  });
});

gulp.task('run', function () {
  require('./www/server.js');
});

// Lambda tasks
gulp.task('clean', function () {
  del([
    './dist',
    './dist.zip',
    ]);
});

gulp.task('bundle', function () {
  gulp
    .src('./package.json')
    .pipe(gulp.dest('./dist'))
    .pipe(install({ production: true }))
  ;
});

gulp.task('compile', function () {
  var tasks = ['config', 'services', 'skill', 'speechAssets'].map(function (directory) {
    return gulp
      .src(directory + '/**/*')
      .pipe(gulp.dest('./dist/' + directory))
    ;
  });
  return merge(tasks);
});

gulp.task('zip', function () {
  gulp
    .src('./dist/**/*')
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('upload', function (callback) {
  var awsConfig = require('./aws-config');
  awsLambda.deploy('./dist.zip', awsConfig, callback);
});

// Deploying
gulp.task('deploy', function (callback) {
  return runSequence(
    ['clean'],
    ['bundle', 'compile'],
    ['zip'],
    ['upload'],
    callback
  );
});
