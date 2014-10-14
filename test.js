var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('webserver', function() {
  gulp.src('/Users/karliky/Documents/ludei/engines/cordova/projects/livereload/')
    .pipe(webserver({
      livereload: true,
      directoryListing: true
    }));
});