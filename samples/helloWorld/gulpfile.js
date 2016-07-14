'use strict';

var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
;


gulp.task('watch', function () {
  nodemon({
    script: 'www/server.js',
    watch: ['www/*', 'config/*', 'services/*', 'skill/*'],
    ext: 'json js',
    ignore: ['node_modules/**/*']
  });
});

gulp.task('run', function() {
  require('./www/server.js');
});
