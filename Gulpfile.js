/* Dependencies (A-Z) */
var _ = require('lodash-node');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var del = require('del');
var gulpif = require('gulp-if');
var filter = require('gulp-filter');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var lazypipe = require('lazypipe');
var less = require('gulp-less');
var minifyHtml = require('gulp-minify-html');
var newer = require('gulp-newer');
var nunjucksRender = require('./lib/nunjucks-render');
var path = require('path');
var prettify = require('gulp-prettify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var stringify = require('json-stable-stringify');
var rjs = require('requirejs');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');

/* Shared configuration (A-Z) */
var pkg = require('./package.json');
var paths = {
	src: 'src/',
	srcComponents: 'src/components/',
	srcVendor: 'src/vendor/',
	srcViews: 'src/views/',
	dist: 'dist/',
	distAssets: 'dist/assets/',
	amdConfig: './src/amd-config.json'
};
paths.assets = [
	paths.src + 'assets/**/*.*',
	paths.srcComponents + '*/assets/**/*.*',
	paths.srcViews + '*/assets/**/*.*'
];
// source files are all files directly in module sub directories and core files,
// excluding abstract files/dirs starting with '_'.
paths.srcFiles = [
		paths.src + '*',
		paths.srcComponents + '*/*',
		paths.srcViews + '*/*' //,
//		'!' + paths.src + '_*',
//		'!' + paths.srcComponents + '_*/*',
//		'!' + paths.srcViews + '_*/*'
];
paths.htmlFiles = paths.srcFiles.map(function(path){ return path + '.html'; });
paths.jsFiles   = paths.srcFiles.map(function(path){ return path + '.js'; });
paths.lessFiles = paths.srcFiles.map(function(path){ return path + '.less'; });

/* Register default & custom tasks (A-Z) */
gulp.task('default', ['build_clean']);
gulp.task('build', ['build_html', 'build_js', 'build_less', 'build_assets']);
gulp.task('build_assets', buildAssetsTask);
gulp.task('build_clean', function(cb) { runSequence('clean_dist', 'build', cb); });
gulp.task('build_html', buildHtmlTask);
gulp.task('build_js',['jshint_src'], buildJsTask);
gulp.task('build_less', buildLessTask);
gulp.task('build_previews', buildPreviewsTask);
gulp.task('clean_dist', function (cb) { del([paths.dist], cb); });
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', jshintNodeTask);
gulp.task('jshint_src', jshintSrcTask);
gulp.task('serve', serveTask);
gulp.task('watch', ['build', 'serve'], watchTask);

/* Tasks and utils (A-Z) */

/**
 * Copy all files from `assets/` directories in source root & modules. Only copies file when newer.
 * The `assets/` string is removed from the original path as the destination is an `assets/` dir itself.
 */
function buildAssetsTask() {
	paths.assets.map(function(path){
		return gulp.src(path, { base: paths.src })
			.pipe(newer(paths.distAssets))
			.pipe(rename(function(p){
				p.dirname = p.dirname
					.split('/')
					.filter(function(dir){ return (dir !== 'assets'); })
					.join('/');
			}))
			.pipe(gulp.dest(paths.distAssets));
	});
}

function buildHtmlTask() {
	configureNunjucks();
	var moduleIndex = getModuleIndex();
	return srcFiles('html')
		.pipe(nunjucksRender(function(file){
			return _.extend(
				htmlModuleData(file),
				{ moduleIndex: moduleIndex }
			);
		}))
		//.pipe(formatHtml())
		.pipe(gulp.dest(paths.dist))
		.pipe(reloadBrowser({ stream:true }));
}

function buildPreviewsTask() {
	configureNunjucks();
	var templateHtml = fs.readFileSync(paths.srcViews + '_component-preview/component-preview.html', 'utf8');
	return gulp.src(paths.srcComponents + '*/*.html', { base: paths.src })
		.pipe(nunjucksRender(htmlModuleData))
		.pipe(nunjucksRender(htmlModuleData, templateHtml))
		.pipe(rename(function(p){ p.basename += '-preview'; }))
		.pipe(gulp.dest(paths.dist));
}

function buildJsTask(cb) {
	var amdConfig = _.extend(
		require('./src/amd-config.json'),
		{
			baseUrl: paths.src,
			generateSourceMaps: true, // http://requirejs.org/docs/optimization.html#sourcemaps
			include: ['index'],
			name: 'vendor/almond/almond',
			optimize: 'uglify2',
			out: paths.distAssets + 'index.js',
			preserveLicenseComments: false
		}
	);
	rjs.optimize(amdConfig);
	if(browserSync.active){ browserSync.reload(); }
	cb();
}

function buildLessTask() {
	// @fix sourcemaps: copy less files to dist?
	return srcFiles('less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer({ browsers: ['> 1%', 'last 2 versions'] })) // https://github.com/postcss/autoprefixer#browsers
		.pipe(sourcemaps.write({includeContent: false, sourceRoot: '' }))
		.pipe(rename(function(p){
			if(p.dirname === '.'){ p.dirname = 'assets'; } // output root src files to assets dir
		}))
		.pipe(gulp.dest(paths.dist))
		.pipe(reloadBrowser({ stream:true }));
}

function configureNunjucks() {
	var env = nunjucksRender.nunjucks.configure(paths.src);
	env.addFilter('match', require('./lib/nunjucks-filter-match'));
	env.addFilter('prettyJson', require('./lib/nunjucks-filter-pretty-json'));
}

var formatHtml = lazypipe()
	.pipe(function() {
		// strip CDATA, comments & whitespace
		return minifyHtml({
			empty: true,
			conditionals: true,
			spare: true,
			quotes: true
		});
	})
	.pipe(function() {
		return prettify({
			indent_size: 2
		});
	});

function getModuleIndex() {
	return {
		components: listDirectories(paths.srcComponents).map(function(name){
			return {
				id: 'components/' + name,
				name: name,
				path: 'components/' + name + '/' + name + '-preview.html',
				type: 'component'
			};
		}),
		views: listDirectories(paths.srcViews).map(function(name){
			return {
				id: 'views/' + name,
				name: name,
				path: 'views/' + name + '/' + name + '.html',
				type: 'view'
			};
		})
	};
}

function htmlModuleData(file) {
	var pathToRoot = path.relative(file.relative, '.');
	pathToRoot = pathToRoot.substring(0, pathToRoot.length - 2);
	return {
		module: {
			id: path.dirname(file.relative),
			name: parsePath(file.relative).basename,
			html: file.contents.toString()
		},
		paths: {
			assets: pathToRoot + 'assets/',
			root: pathToRoot
		},
		pkg: pkg
	};
}

function jshintNodeTask() {
	return gulp.src(['*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(require('jshint-stylish')));
}

function jshintSrcTask() {
	return srcFiles('js')
		.pipe(jscs())
		.pipe(jshint(paths.src + '.jshintrc'))
		.pipe(jshint.reporter(require('jshint-stylish')));
}

function listDirectories(cwd) {
	return fs.readdirSync(cwd)
		.filter(function(file){
			return fs.statSync(cwd + file).isDirectory();
		});
}

function parsePath(filepath) {
	var extname = path.extname(filepath);
	return {
		dirname: path.dirname(filepath),
		basename: path.basename(filepath, extname),
		extname: extname
	};
}

function reloadBrowser(options){
	// only reload browserSync if active, otherwise causes an error.
	return gulpif(browserSync.active, browserSync.reload(options));
}

function serveTask() {
	// http://www.browsersync.io/docs/gulp/
	browserSync({
		server: {
			baseDir: paths.dist
		}
	});
}

function srcFiles(filetype) {
	return gulp.src(paths.srcFiles, { base: paths.src })
		.pipe(filter('**/*.' + filetype));
}

function watchTask () {
	gulp.watch(paths.htmlFiles, ['build_html']);
	gulp.watch(paths.jsFiles,   ['build_js']);
	gulp.watch(paths.lessFiles, ['build_less']);
}