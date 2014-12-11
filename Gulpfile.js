/* Dependencies (A-Z) */
var _ = require('lodash-node');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var cached = require('gulp-cached');
var del = require('del');
var gulpif = require('gulp-if');
var filter = require('gulp-filter');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var karma = require('gulp-karma');
var lazypipe = require('lazypipe');
var less = require('gulp-less');
var minifyHtml = require('gulp-minify-html');
var moduleUtility = require('./lib/module-utility');
var newer = require('gulp-newer');
var nunjucksMarkdown = require('nunjucks-markdown');
var nunjucksRender = require('./lib/nunjucks-render');
var path = require('path');
var plumber = require('gulp-plumber');
var prettify = require('gulp-prettify');
var prism = require('./lib/prism');
var recess = require('gulp-recess');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rjs = require('requirejs');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var stringify = require('json-stable-stringify');

/* Shared configuration (A-Z) */
var config = require('./config.js');
var paths = config.paths;
var pkg = require('./package.json');

/* Register default & custom tasks (A-Z) */
gulp.task('default', ['build_guide']);
gulp.task('build', ['build_html', 'build_js', 'build_less', 'build_assets']);
gulp.task('build_assets', buildAssetsTask);
gulp.task('build_clean', function(cb) { runSequence('clean_dist', 'build', cb); });
gulp.task('build_guide', function(cb) { runSequence('build_clean', 'build_previews', 'build_module_info', cb); });
gulp.task('build_html', buildHtmlTask);
gulp.task('build_js',['jshint_src'], buildJsTask);
gulp.task('build_less', buildLessTask);
gulp.task('build_module_info', buildModuleInfoTask);
gulp.task('build_previews', buildPreviewsTask);
gulp.task('clean_dist', function (cb) { del([paths.dist], cb); });
gulp.task('create_module', createModule);
gulp.task('edit_module', editModule);
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', jshintNodeTask);
gulp.task('jshint_src', jshintSrcTask);
gulp.task('remove_module', removeModule);
gulp.task('serve', serveTask);
gulp.task('test_run', testTask('run'));
gulp.task('test_watch', testTask('watch'));
gulp.task('watch', function(cb) { runSequence(['build_guide', 'serve'], watchTask); });

/* Tasks and utils (A-Z) */

/**
 * Copy all files from `assets/` directories in source root & modules. Only copies file when newer.
 * The `assets/` string is removed from the original path as the destination is an `assets/` dir itself.
 */
function buildAssetsTask() {
	paths.assetFiles.map(function(path){
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
	var moduleIndex = moduleUtility.getModuleIndex();
	return srcFiles('html')
		.pipe(plumber()) // prevent pipe break on nunjucks render error
		.pipe(nunjucksRender(function(file){
			return _.extend(
				htmlModuleData(file),
				{ moduleIndex: moduleIndex }
			);
		}))
		.pipe(plumber.stop())
		//.pipe(formatHtml())
		.pipe(gulp.dest(paths.dist))
		.pipe(reloadBrowser({ stream:true }));
}

function buildModuleInfoTask() {
	var marked = require('marked');
	['Components', 'Views'].forEach(function(moduleType){
		listDirectories(paths['src' + moduleType])
			.filter(function(name){ return (name.substr(0,1) !== '_'); })
			.map(function(name){
				var srcBasename  = paths['src' + moduleType]  + name + '/' + name;
				var distBasename = paths['dist' + moduleType] + name + '/' + name;
				var moduleInfo = {
					name: name,
					readme  : marked(getFileContents(paths['src' + moduleType]  + name + '/README.md')),
					html    : highlightCode(getFileContents(distBasename + '.html'), 'markup'),
					css     : highlightCode(getFileContents(distBasename + '.css'), 'css'),
					template: highlightCode(getFileContents(srcBasename + '.html'), 'twig'),
					less    : highlightCode(getFileContents(srcBasename + '.less'), 'css'),
					js      : highlightCode(getFileContents(srcBasename + '.js'), 'javascript')
				};
				fs.writeFileSync(distBasename + '-info.json', JSON.stringify(moduleInfo, null, 4));
			});
	});
}

function buildPreviewsTask() {
	configureNunjucks();
	var templateHtml = fs.readFileSync(paths.srcViews + '_component-preview/component-preview.html', 'utf8');
	return gulp.src(paths.srcComponents + '*/*.html', { base: paths.src })
		.pipe(plumber()) // prevent pipe break on nunjucks render error
		.pipe(nunjucksRender(htmlModuleData))
		.pipe(nunjucksRender(htmlModuleData, templateHtml))
		.pipe(plumber.stop())
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
	return srcFiles('less')
		.pipe(plumber()) // prevent pipe break on less parsing
		.pipe(sourcemaps.init())
		.pipe(less())
		//.pipe(recess())
		//.pipe(recess.reporter())
		//.pipe(autoprefixer({ browsers: config.autoprefixBrowsers }))
		.pipe(sourcemaps.write('.', {includeContent: true, sourceRoot: '' }))
		.pipe(plumber.stop())
		.pipe(rename(function(p){
			if(p.dirname === '.'){ p.dirname = 'assets'; } // output root src files to assets dir
		}))
		.pipe(gulp.dest(paths.dist)) // write the css and source maps
		.pipe(filter('**/*.css')) // filtering stream to only css files
		.pipe(reloadBrowser({ stream:true }));
}

function configureNunjucks() {
	var env = nunjucksRender.nunjucks.configure(paths.src);
	nunjucksMarkdown.register(env);
	env.addFilter('match', require('./lib/nunjucks-filter-match'));
	env.addFilter('prettyJson', require('./lib/nunjucks-filter-pretty-json'));
}
function createModule() {
	return moduleUtility.create();
}
function editModule() {
	return moduleUtility.edit();
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

function getFileContents(path){
	if(fs.existsSync(path)){
		return fs.readFileSync(path, 'utf8');
	} else {
		return '';
	}
}

/**
 * Use PrismJS in Node: https://github.com/LeaVerou/prism/pull/179
 * @param {string} code
 * @param {string} lang
 * @returns {string}
 */
function highlightCode(code, lang){
	if(!code.length){ return code; }
	code = prism.highlight(code, prism.languages[lang]);
	code = '<pre class="language-' + lang + '"><code>' + code + '</code></pre>';
	return code;
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
		.pipe(cached('hinting')) // filter down to changed files only
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

function removeModule() {
	return moduleUtility.remove();
}

function testTask(action) {
	return function () {
		return gulp.src([
			// files you put in this array override the files array in karma.conf.js
		])
		.pipe(karma({
			configFile: paths.karmaConfig,
			action: action
		}))
		.on('error', function (err) {
			throw err;
		});
	};
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
	gulp.watch(paths.assetFiles, ['build_assets']);
	gulp.watch(paths.htmlFiles, ['build_html', 'build_previews']);
	gulp.watch(paths.jsFiles,   ['build_js']);
	gulp.watch(paths.lessFiles, ['build_less']);
}
