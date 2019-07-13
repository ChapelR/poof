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
        .pipe(uglify().on('error', function(e){ console.log(e); }))
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
    return gulp.src('./src/*.js') // only non-vendor scripts
        .pipe(jshint())
        .pipe(jshint.reporter('default', { beep : true }));
}

// clean
function cleanDist () {
    return del('./dist/**/*');
}
function cleanStaging () {
    return del('./staging');
}

// build functions
function buildScripts () {
    var path = './src/js/';
    var scriptArray = [
        // vendor scripts
        'vendor/jquery.js',
        'vendor/highlight.pack.js',
        'vendor/download.js',
        // scripts
        'util.js',
        'modal.js',
        'buttons.js',
        'forms.js',
        'config.js',
        'lint.js',
        'proofing.js',
        'parser.js',
        'state.js',
        'tools.js',
        'export.js',
        'comments.js',
        'comment-import.js',
        'view-modes.js',
        'menu.js',
        'init.js'
    ].map( function (file) {
        return path + file;
    });
    return processScripts(scriptArray, './staging', 'poof.min.js');
}

function buildStyles () {
    var path = './src/css/';
    var styleArray = [
        // vendor styles
        'vendor/normal.css',
        'vendor/pure.css',
        'vendor/r-github.css',
        'vendor/loader.css',
        // styles
        'base.css',
        'passages.css',
        'simple.css',
        'modal.css',
        'comments.css',
        'linter.css',
        'night.css'
    ].map( function (file) {
        return path + file;
    });
    return processStyles(styleArray, './staging', 'poof.min.css');
}

function makeTemplate () {
    return gulp.src('./src/template.html')
        .pipe(replace(/<!--!.*?-->/g, ''))
        .pipe(replace('/% byline %/', fs.readFileSync('./src/byline.txt', 'utf8')))
        .pipe(replace('/% version %/', version))
        .pipe(replace('/% stylesheet %/', fs.readFileSync('./staging/poof.min.css', 'utf8')))
        .pipe(replace('/% scripts %/', fs.readFileSync('./staging/poof.min.js', 'utf8')))
        .pipe(replace(/\s+/g, ' '))
        .pipe(escape())
        .pipe(rename('template.js'))
        .pipe(gulp.dest('./staging'));
}

function makeFormat () {
    // removed minification step for Tweego compatibility
    return gulp.src('./src/format.js')
        .pipe(replace('/% version %/', version))
        .pipe(replace('/% code %/', fs.readFileSync('./staging/template.js')))
        .pipe(rename('format.js'))
        .pipe(gulp.dest('./dist'));
}

// tasks
gulp.task('clean', cleanDist);
gulp.task('restage', cleanStaging);
gulp.task('scripts', buildScripts);
gulp.task('styles', buildStyles);
gulp.task('templ', makeTemplate);
gulp.task('format', makeFormat);
gulp.task('rimraf', gulp.parallel('clean', 'restage'));
gulp.task('files', gulp.parallel('scripts', 'styles'));
gulp.task('build', gulp.series('rimraf', 'files', 'templ', 'format', 'restage'));
gulp.task('lint', lint);