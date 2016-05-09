var gulp = require('gulp');
var ts = require('gulp-typescript');

var tsProject = ts.createProject('./tsconfig.json');
var springboardModsPath = "/Users/jun/Sites/web-education/mods/fr.openent~exercizer~0.1-SNAPSHOT";

gulp.task('compile', function(){
    var tsResult = tsProject.src()
		.pipe(ts(tsProjecgit));

    return tsResult.js.pipe(gulp.dest('src/main/resources/public/js'));
});

gulp.task('copy-resources', ['compile'], function() {
	return gulp.src('src/main/resources/**/*')
		.pipe(gulp.dest(springboardModsPath));
});

gulp.task('watch-resources', function() {
	gulp.watch('src/main/resources/**/*', ['copy-resources']);
});
