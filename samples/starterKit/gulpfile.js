'use strict';

const gulp = require('gulp');
const ngrok = require('ngrok');
const nodemon = require('gulp-nodemon');
const config = require('./config');

gulp.task('watch', ['ngrok'], () =>
  nodemon({
    script: 'server.js',
    watch: ['config/*', 'services/*', 'skill/*', 'server.js'],
    ext: 'json js',
    ignore: ['node_modules/**/*'],
  }));

gulp.task('ngrok', (done) => {
  ngrok.connect({
    proto: 'http',
    addr: config.server.port,
  }, (err, url) => {
    if (err) {
      return done(err);
    }

    console.log(`ngrok tunnel started at ${url}`);
    return done();
  });
});

gulp.task('run', ['ngrok'], () =>
  require('./server.js'));
