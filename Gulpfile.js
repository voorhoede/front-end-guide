/* Dependencies (A-Z) */
var del = require('del');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var gulp = require('gulp');
var less = require('gulp-less');
var minifyHtml = require('gulp-minify-html');
var nunjucksRender = require('gulp-nunjucks-render');
var prettify = require('gulp-prettify');
var webserver = require('gulp-webserver');

var amdOptimize = require('gulp-amd-optimizer');
var concat = require('gulp-concat');
var sourcemap = require('gulp-sourcemaps');

/* Shared configuration (A-Z) */
var pkg = require('./package.json');
var paths = {
	src: 'src/',
	srcComponents: 'src/components/',
	srcVendor: 'src/vendor/',
	srcViews: 'src/views',
	dist: 'dist/'
};
paths.srcFiles = [paths.src + '*', paths.srcComponents + '*/*', paths.srcViews + '*/*'];

/* Register default & custom tasks (A-Z) */
gulp.task('default', ['build']);
gulp.task('build', ['build_html', 'build_less']);
gulp.task('build_html', buildHtmlTask);
gulp.task('build_less', buildLessTask);
gulp.task('clean_dist', cleanDistTask);
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', jshintNodeTask);
gulp.task('jshint_src', jshintSrcTask);
gulp.task('serve', serveTask);

/* Tasks and utils (A-Z) */
function buildHtmlTask() {
	nunjucksRender.nunjucks.configure([paths.src]);
	return gulp.src(paths.srcFiles)
		.pipe(filter('**/*.html'))
		.pipe(nunjucksRender({
			pkg: pkg
		}))
		.pipe(minifyHtml({
			empty: true,
			conditionals: true,
			spare: true
		}))
		.pipe(prettify({
			indent_size: 2
		}))
		.pipe(gulp.dest(paths.dist));
}

function buildLessTask() {
	return gulp.src(paths.srcFiles)
		.pipe(filter('**/*.less'))
		.pipe(less())
		.pipe(gulp.dest(paths.dist));
}

function cleanDistTask (cb) {
	del([paths.dist], cb);
}

function jshintNodeTask() {
	return gulp.src(['*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(require('jshint-stylish')));
}

function jshintSrcTask() {
	return gulp.src([paths.src + '**/*.js', '!'+ paths.srcVendor])
		.pipe(jshint(paths.src + '.jshintrc'))
		.pipe(jshint.reporter(require('jshint-stylish')));
}

function serveTask() {
	gulp.src(paths.dist)
		.pipe(webserver({
			open: true
		}));
}

gulp.task('build_js', function () {
	var amdConfig = require('./src/amd-config.json');
	return gulp.src('src/*.js', { base: amdConfig.baseUrl })
		.pipe(sourcemap.init())
		.pipe(amdOptimize(amdConfig))
		.pipe(concat('index.js'))
		.pipe(sourcemap.write('./', { includeContent: false, sourceRoot: '../src' }))
		.pipe(gulp.dest(paths.dist));
});