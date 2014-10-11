/* Dependencies (A-Z) */
var del = require('del');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var fs = require('fs');
var gulp = require('gulp');
var lazypipe = require('lazypipe');
var less = require('gulp-less');
var minifyHtml = require('gulp-minify-html');
var nunjucksRender = require('gulp-nunjucks-render');
var prettify = require('gulp-prettify');
var runSequence = require('run-sequence');
//var watch = require('gulp-watch');
var webserver = require('gulp-webserver');

// @todo properly configure amd optimization
var amdOptimize = require('gulp-amd-optimizer');
var concat = require('gulp-concat');
var sourcemap = require('gulp-sourcemaps');

/* Shared configuration (A-Z) */
var pkg = require('./package.json');
var paths = {
	src: 'src/',
	srcComponents: 'src/components/',
	srcVendor: 'src/vendor/',
	srcViews: 'src/views/',
	dist: 'dist/'
};
// source files are all files directly in module sub directories and core files,
// excluding abstract files/dirs starting with '_'.
paths.srcFiles = [
		paths.src + '*',
		paths.srcComponents + '*/*',
		paths.srcViews + '*/*',
		'!' + paths.src + '_*',
		'!' + paths.srcComponents + '_*/*',
		'!' + paths.srcViews + '_*/*'
];

/* Register default & custom tasks (A-Z) */
gulp.task('default', ['build_clean']);
gulp.task('build', ['build_html', 'build_less']);
gulp.task('build_clean', function(cb) { runSequence('clean_dist', 'build', cb); });
gulp.task('build_html', buildHtmlTask);
gulp.task('build_less', buildLessTask);
gulp.task('clean_dist', function (cb) { del([paths.dist], cb); });
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', jshintNodeTask);
gulp.task('jshint_src', jshintSrcTask);
gulp.task('serve', serveTask);

/* Tasks and utils (A-Z) */

var formatHtml = lazypipe()
	.pipe(function() {
		// strip CDATA, comments & whitespace
		return minifyHtml({
			empty: true,
			conditionals: true,
			spare: true
		});
	})
	.pipe(function() {
		return prettify({
			indent_size: 2
		});
	});

function buildHtmlTask() {
	nunjucksRender.nunjucks.configure([paths.src]);
	var moduleIndex = getModuleIndex();
	return srcFiles('html')
		.pipe(nunjucksRender({
			moduleIndex: moduleIndex,
			pkg: pkg
		}))
		.pipe(formatHtml())
		.pipe(gulp.dest(paths.dist));
}

function buildLessTask() {
	return srcFiles('less')
		.pipe(less())
		.pipe(gulp.dest(paths.dist));
}

function listModuleDirectories(cwd) {
	return fs.readdirSync(cwd)
		.filter(function(file){
			return fs.statSync(cwd + file).isDirectory();
		})
		.filter(function(file){
			return (file.substr(0,1) !== '_');
		});
}

function getModuleIndex() {
	return {
		components: listModuleDirectories(paths.srcComponents),
		views: listModuleDirectories(paths.srcViews)
	};
}

function jshintNodeTask() {
	return gulp.src(['*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(require('jshint-stylish')));
}

function jshintSrcTask() {
	return srcFiles('js')
		.pipe(jshint(paths.src + '.jshintrc'))
		.pipe(jshint.reporter(require('jshint-stylish')));
}

function serveTask() {
	gulp.src(paths.dist)
		.pipe(webserver({
			open: true
		}));
}

function srcFiles(filetype) {
	return gulp.src(paths.srcFiles, { base: paths.src })
		.pipe(filter('**/*.' + filetype));
}

// https://github.com/mariusGundersen/gulp-amd-optimize#sourcemap
// alternatives:
// * https://github.com/smrtlabs/smrt-gulp-r
// * regular rjs + almond with task like clean_dist?
gulp.task('build_js', function () {
	var amdConfig = require('./src/amd-config.json');
	return gulp.src('src/*.js', { base: amdConfig.baseUrl })
		.pipe(sourcemap.init())
		.pipe(amdOptimize(amdConfig))
		.pipe(concat('index.js'))
		.pipe(sourcemap.write('./', { includeContent: false, sourceRoot: '../src' }))
		.pipe(gulp.dest(paths.dist));
});