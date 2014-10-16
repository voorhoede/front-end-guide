/* Dependencies (A-Z) */
var _ = require('lodash-node');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var del = require('del');
var debug = require('gulp-debug');
var gulpif = require('gulp-if');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var lazypipe = require('lazypipe');
var less = require('gulp-less');
var minifyHtml = require('gulp-minify-html');
var newer = require('gulp-newer');
var nunjucksRender = require('gulp-nunjucks-render');
var path = require('path');
var prettify = require('gulp-prettify');
var rename = require('gulp-rename');
var rjs = require('requirejs');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var inquirer = require('inquirer');
var replace = require('gulp-replace');
//var watch = require('gulp-watch');

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
	dist: 'dist/',
	distAssets: 'dist/assets/'
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
		paths.srcViews + '*/*',
		'!' + paths.src + '_*',
		'!' + paths.srcComponents + '_*/*',
		'!' + paths.srcViews + '_*/*'
];
paths.htmlFiles = paths.srcFiles.map(function(path){ return path + '.html'; });
paths.lessFiles = paths.srcFiles.map(function(path){ return path + '.less'; });

/* Register default & custom tasks (A-Z) */
gulp.task('default', ['build_clean']);
gulp.task('build', ['build_html', 'build_js', 'build_less', 'build_assets']);
gulp.task('build_assets', buildAssetsTask);
gulp.task('build_clean', function(cb) { runSequence('clean_dist', 'build', cb); });
gulp.task('build_html', buildHtmlTask);
gulp.task('build_js', buildJsTask);
gulp.task('build_less', buildLessTask);
gulp.task('build_previews', buildPreviewsTask);
gulp.task('clean_dist', function (cb) { del([paths.dist], cb); });
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', jshintNodeTask);
gulp.task('jshint_src', jshintSrcTask);
gulp.task('serve', serveTask);
gulp.task('watch', ['build', 'serve'], watchTask);
gulp.task('ask', ask);

/* Tasks and utils (A-Z) */

function buildAssetsTask() {
	paths.assets.map(function(path){
		return gulp.src(path, { base: paths.src })
			.pipe(newer(paths.distAssets))
			.pipe(rename(function(p){
				p.dirname = p.dirname.replace('/assets', '');
			}))
			.pipe(gulp.dest(paths.distAssets));
	});
}

function buildHtmlTask() {
	nunjucksRender.nunjucks.configure([paths.src]);
	var moduleIndex = getModuleIndex();
	return srcFiles('html')
		.pipe(nunjucksRender({
//			module: {
//				name: parsePath(file).basename
//			},
			moduleIndex: moduleIndex,
			paths: {
				assets: '../../assets/'
			},
			pkg: pkg
		}))
		.pipe(formatHtml())
		.pipe(gulp.dest(paths.dist))
		.pipe(reloadBrowser({ stream:true }));
}

function buildPreviewsTask() {
	getModuleIndex().components.forEach(function(component){

	});
}
function ask(cb){
	var thing;
	var answers = inquirer.prompt([{
		type: 'list',
		name: 'what',
		message: 'would you like to create a component or a view?',
		choices:[
			'component',
			'view'
		]
	},{
		type: 'input',
		name: 'componentName',
		message: function (answer) {
			thing = answer.what;
			return ['Give the new',thing,'a name'].join(' ');
		},
		validate: function validateComponentName(componentName) {
			var validName = /^[a-zA-Z0-9-_]+$/.test(componentName);
			var pathName = [paths.src,thing,'s/',componentName].join('');
			var validPath = !fs.existsSync(path.normalize(pathName));
			if(!validName){
				return ['bad',thing,'name'].join(' ');
			}else if(!validPath){
				return ['the',thing,'already exists'].join(' ');
			}
			return true;
		}
	},{
		type:'checkbox',
		name:'files',
		message:'Which types of files do you want to include? Press enter when ready..',
		choices:[
			{
				name:'html',
				value:'html'
			},
			{
				name:'less',
				value:'less'
			},
			{
				name:'javascript',
				value:'js'
			}
		],
		validate: function(input){
			if(!input.length){
				return 'You must select at least one type of file'
			}
			return true;
		}
	}
	], function createStuff(answers) {
		gulp.src(
			answers.files.map(function (fileType) {
				return ['src/views/_templates/_TEMPLATE.',fileType].join('');
			})
		)
			.pipe(replace(/\{REPLACE\}/, [answers.what, answers.componentName].join(' ')))
			.pipe(rename({
				basename:answers.componentName
			}))
			.pipe(gulp.dest([
					paths.src,
					answers.what,
					's/',
					answers.componentName
				].join('')
			)
		);
		cb();
	});
}

// https://github.com/mariusGundersen/gulp-amd-optimize#sourcemap
// alternatives:
// * https://github.com/smrtlabs/smrt-gulp-r
// * regular rjs + almond with task like clean_dist?
//gulp.task('build_js', function () {
//	var amdConfig = require('./src/amd-config.json');
//	return gulp.src('src/*.js', { base: amdConfig.baseUrl })
//		.pipe(sourcemap.init())
//		.pipe(amdOptimize(amdConfig))
//		.pipe(concat('index.js'))
//		.pipe(sourcemap.write('./', { includeContent: false, sourceRoot: '../src' }))
//		.pipe(gulp.dest(paths.dist));
//});
function buildJsTask(cb) {
	var amdConfig = _.extend(
		require('./src/amd-config.json'),
		{
			baseUrl: paths.src,
			generateSourceMaps: true, // http://requirejs.org/docs/optimization.html#sourcemaps
			include: ['index'],
			name: 'vendor/almond/almond',
			optimize: 'uglify2',
			out: paths.dist + 'index.js',
			preserveLicenseComments: false
		}
	);
	rjs.optimize(amdConfig);
	cb();
}

function buildLessTask() {
	// @fix sourcemaps: copy less files to dist?
	return srcFiles('less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer({ browsers: ['> 1%', 'last 2 versions'] })) // https://github.com/postcss/autoprefixer#browsers
		.pipe(sourcemaps.write({includeContent: false, sourceRoot: '' }))
		.pipe(gulp.dest(paths.dist))
		.pipe(reloadBrowser({ stream:true }));
}

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

function listModuleDirectories(cwd) {
	return fs.readdirSync(cwd)
		.filter(function(file){
			return fs.statSync(cwd + file).isDirectory();
		})
		.filter(function(file){
			return (file.substr(0,1) !== '_');
		});
}

// borrowed from gulp-rename https://github.com/hparra/gulp-rename/blob/master/index.js#L9
function parsePath(path) {
	var extname = path.extname(path);
	return {
		dirname: path.dirname(path),
		basename: path.basename(path, extname),
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
	gulp.watch(paths.lessFiles, ['build_less']);
}