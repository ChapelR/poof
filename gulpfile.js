var gulp = require('gulp'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    del = require('del'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean-css'),
    autoprefix = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    escape = require('gulp-js-escape'),
    fs = require('fs'),
    version = require('./package.json').version;

function processScripts (dir, out, name) {
    return gulp.src(dir)
        .pipe(concat(name))
        .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(out));
}

function processStyles (dir, out, name) {
    return gulp.src(dir)
        .pipe(concat(name))
        .pipe(clean())
        .pipe(autoprefix())
        .pipe(gulp.dest(out));
}

// linting 
function lint () {
    return gulp.src('./src')
        .pipe(jshint())
        .pipe(jshint.reporter('default', { beep : true }));
}

// clean
function rimraf () {
    return del('./dist/**/*');
}

// build functions
function buildScripts () {
    return processScripts('./src/js/**/*.js', './dist', 'poof.min.js');
}

function buildStyles () {
    return processStyles('./src/**/*.css', './dist', 'poof.min.css');
}

function makeTemplate () {
    return gulp.src('./src/template.html')
        .pipe(replace(/<!--!.*?-->/g, ''))
        .pipe(replace('/% byline %/', fs.readFileSync('./src/byline.txt', 'utf8')))
        .pipe(replace('/% version %/', version))
        .pipe(replace('/% stylesheet %/', fs.readFileSync('./dist/poof.min.css', 'utf8')))
        .pipe(replace('/% scripts %/', fs.readFileSync('./dist/poof.min.js', 'utf8')))
        .pipe(replace(/\s+/g, ' '))
        .pipe(escape())
        .pipe(rename('template.js'))
        .pipe(gulp.dest('./dist'));
}

function makeFormat () {
    return gulp.src('./src/format.js')
        .pipe(replace('/% version %/', version))
        .pipe(replace('/% code %/', fs.readFileSync('./dist/template.js')))
        .pipe(rename('format.js'))
        .pipe(gulp.dest('./dist/format'));
}

// tasks
gulp.task('clean', rimraf);
gulp.task('scripts', buildScripts);
gulp.task('styles', buildStyles);
gulp.task('templ', makeTemplate);
gulp.task('format', makeFormat);
gulp.task('files', gulp.parallel('scripts', 'styles'));
gulp.task('build', gulp.series('clean', 'files', 'templ', 'format'));
gulp.task('lint', lint);