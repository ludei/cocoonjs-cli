var gulp = require('gulp'),
	connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    root: '/Users/karliky/Documents/ludei/engines/cordova/projects/livereload',
    livereload: true
  });
});

gulp.task('html', function () {
	debugger;
  gulp.src('/Users/karliky/Documents/ludei/engines/cordova/projects/livereload/*.html').pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['/Users/karliky/Documents/ludei/engines/cordova/projects/livereload/*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);