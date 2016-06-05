var gulp = require('gulp');
var ts = require('gulp-typescript');
var privateConfig = require('./privateConfig');

var tsProject = ts.createProject('./tsconfig.json');
var springboardModsPath = privateConfig.springboardModsPath;

gulp.task('compile', function() {
    var tsResult = tsProject.src()
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest('src/main/resources/public/js'));
});

gulp.task('copy-resources', ['compile'], function() {
    return gulp.src('src/main/resources/**/*')
        .pipe(gulp.dest(springboardModsPath));
});

gulp.task('watch-resources', function() {
    gulp.watch('src/main/resources/**/*', ['copy-resources']);
});