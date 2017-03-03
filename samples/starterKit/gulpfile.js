'use strict';

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('watch', () =>
  nodemon({
    script: 'server.js',
    watch: ['config/*', 'services/*', 'skill/*', 'server.js'],
    ext: 'json js',
    ignore: ['node_modules/**/*'],
  }));

gulp.task('run', () =>
  require('./server.js'));
