var gulp = require('gulp');

var springboardModsPath = "/Users/elbywan/WSE/leo/mods/fr.openent~exercizer~0.1-SNAPSHOT";

gulp.task('copy-resources', function() {
	return gulp.src('src/main/resources/**/*')
		.pipe(gulp.dest(springboardModsPath));
});

gulp.task('watch-resources', function() {
	gulp.watch('src/main/resources/**/*', ['copy-resources']);
});
