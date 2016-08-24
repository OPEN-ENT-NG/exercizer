var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var privateConfig = "";

try {
    privateConfig = require('./privateConfig');
} catch(e) {}

console.log(privateConfig);
var tsProject = ts.createProject('./tsconfig.json');
var springboardModsPath = privateConfig.springboardModsPath;

gulp.task('build', function() {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src/main/resources/public/js'));
});

gulp.task('copy-resources', ['compile'], function() {
    return gulp.src('src/main/resources/**/*')
        .pipe(gulp.dest(springboardModsPath));
});

gulp.task('watch-resources', function() {
    gulp.watch('./src/main/resources/**/*', ['copy-resources']);
});