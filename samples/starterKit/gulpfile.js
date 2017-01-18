'use strict';

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const del = require('del');
const install = require('gulp-install');
const merge = require('merge-stream');
const zip = require('gulp-zip');
const awsLambda = require('node-aws-lambda');
const runSequence = require('run-sequence');

gulp.task('watch', () =>
  nodemon({
    script: 'www/server.js',
    watch: ['www/*', 'config/*', 'services/*', 'skill/*'],
    ext: 'json js',
    ignore: ['node_modules/**/*'],
  }));

gulp.task('run', () =>
  require('./www/server.js'));

// Lambda tasks
gulp.task('clean', () =>
  del([
    './dist',
    './dist.zip',
  ]));

gulp.task('bundle', () =>
  gulp
    .src('./package.json')
    .pipe(gulp.dest('./dist'))
    .pipe(install({ production: true })));

gulp.task('compile', () => {
  const tasks = ['config', 'services', 'skill', 'speechAssets'].map(directory => gulp
      .src(`${directory}/**/*`)
      .pipe(gulp.dest(`./dist/${directory}`)));
  return merge(tasks);
});

gulp.task('zip', () => gulp
    .src('./dist/**/*')
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./')));

gulp.task('upload', (callback) => {
  const awsConfig = require('./aws-config');
  awsLambda.deploy('./dist.zip', awsConfig, callback);
});

// Deploying
gulp.task('deploy', callback => runSequence(
    ['clean'],
    ['bundle', 'compile'],
    ['zip'],
    ['upload'],
    callback));
