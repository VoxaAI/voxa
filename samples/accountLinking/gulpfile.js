'use strict';

const gulp = require('gulp');
const ngrok = require('ngrok');
const nodemon = require('gulp-nodemon');
const s3 = require('gulp-s3-upload')({ useIAM: true });
const config = require('./config');

gulp.task('watch', ['ngrok'], () =>
  nodemon({
    script: 'www/server.js',
    watch: ['www/*', 'config/*', 'services/*', 'skill/*'],
    ext: 'json js',
    ignore: ['node_modules/**/*'],
  }));

gulp.task('run', ['ngrok'], () =>
  require('./www/server.js'));

gulp.task('upload', () => gulp.src('./www/public/**')
  .pipe(s3({
    Bucket: config.s3.bucket, //  Required
    ACL: 'public-read',       //  Needs to be user-defined
  }, {
    // S3 Constructor Options, ie:
    maxRetries: 5,
  })));

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
