/* Dependencies (A-Z) */
var _ = require('lodash-node');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var changelog = require('conventional-changelog');
var del = require('del');
var debug = require('gulp-debug');
var exec = require('child_process').exec;
var filter = require('gulp-filter');
var fs = require('fs');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var lazypipe = require('lazypipe');
var less = require('gulp-less');
var minifyHtml = require('gulp-minify-html');
var newer = require('gulp-newer');
var nunjucksRender = require('gulp-nunjucks-render');
var path = require('path');
var prettify = require('gulp-prettify');
var Q = require('q');
var rjs = require('requirejs');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var stringify = require('json-stable-stringify');


/* Shared configuration (A-Z) */
var pkg = require('./package.json');
var paths = {
	src: 'src/',
	srcComponents: 'src/components/',
	srcVendor: 'src/vendor/',
	srcViews: 'src/views/',
	dist: 'dist/',
	distAssets: 'dist/assets/',
	amdConfig: './src/amd-config.json',
	changelog: './CHANGELOG.md'
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
gulp.task('create_module', createModulePrompt);
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', jshintNodeTask);
gulp.task('jshint_src', jshintSrcTask);
gulp.task('serve', serveTask);
gulp.task('watch', ['build', 'serve'], watchTask);
gulp.task('changelog', createChangeLog);
gulp.task('bump', ['changelog'], bump);
gulp.task('test', isChangelogModified);

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

/**
 * Create a component or a view with files depending on user feedback through inquirer.
 * if the view or components includes JS, its mapping is added to AMD config.
 * https://www.npmjs.org/package/inquirer
 */
function createModulePrompt(cb){
	var moduleType, moduleName, modulePath;

	inquirer.prompt([{
		type: 'list',
		name: 'moduleType',
		message: 'Would you like to create a component or a view?',
		choices:['component', 'view']
	},{
		type: 'input',
		name: 'moduleName',
		message: function (answer) {
			moduleType = answer.moduleType;
			return ['Give the new',moduleType,'a name'].join(' ');
		},
		validate: function validateModuleName(moduleName) {
			var validName = /^[a-z][a-z0-9-_]+$/.test(moduleName);
			modulePath  = paths.src + moduleType + 's/' + moduleName;
			var validPath = !fs.existsSync(path.normalize(modulePath));
			if(!validName){
				return ['bad', moduleType, 'name'].join(' ');
			}else if(!validPath){
				return ['the', moduleType, 'already exists'].join(' ');
			}
			return true;
		}
	},{
		type:'checkbox',
		name:'files',
		message:'Which types of files do you want to include? Press enter when ready.',
		choices:[
			{ name: 'HTML', value: 'html', checked: true },
			{ name: 'LESS/CSS', value: 'less', checked: true },
			{ name: 'JavaScript', value: 'js', checked: false },
			{ name: 'README', value: 'md', checked: true }
		],
		validate: function(input){
			return (input.length) ? true : 'You must select at least one type of file';
		}
	}], function createModule(answers) { // callback to inquirer.prompt.
		var moduleType = answers.moduleType;
		var moduleName = answers.moduleName;
		var moduleDir  = [moduleType, moduleName].join('s/');

		gulp.src(answers.files.map(function (extName) {
				return [paths.src, moduleType + 's/', '_template/*.', extName].join('');
			}))
			.pipe(replace(/MODULE_NAME/g, moduleName))
			.pipe(rename(function(p){
				if(p.basename !== 'README'){ p.basename = moduleName; }
			}))
			.pipe(gulp.dest(modulePath)
		);
		if(answers.files.indexOf('js') >= 0){
			registerAmdModule(moduleDir, moduleName);
		}
		gutil.log(['Successfully created', moduleName, moduleType].join(' '));
		cb();
	});
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
function bump(cb){
	gutil.log('Make sure your working directory is clean before trying to bump the version');
	inquirer.prompt([
		{
			type:'list',
			name:'semver',
			choices:[
				'major',
				'minor',
				'patch'
			],
			default:'patch',
			message:'Specify type of version bump.'
		},{
			type:'input',
			name:'message',
			message:'Enter a commit message for the tag',
			default:'%s'
		},{
			type:'confirm',
			name:'pushTag',
			message: 'Do you want to push the new new tag to the repository\'s remote?',
			default:false
		}
	],function inquireCallback(answers) {
		var command = [
			'npm version',
			answers.semver,
			'-m',
			'"'+ answers.message +'"'
		].join(' ');
		isChangelogModified()
			.then(commitChangeLog)
			.then(function fireBumpCallback() {
				exec(command, function bumpCallback(err,stdout,stderror) {
					gutil.log('bump version');
					if(err){
						console.error('error:',err);
						return err;
					}
					if(answers.pushTag){
						exec('git push --tags --dry-run', function gitPushCallback(err,stdout,stderror) {
							gutil.log('push the tags');
							if(err){
								console.log(err);
								return err;
							}
							gutil.log('pushed tag to remote');
							cb();
						});
					}else{
						cb();
					}
				});
			});
	});
}
function isChangelogModified() {
	var deferred = Q.defer();
	exec('git status --short ' + paths.changelog, function getChangelogGitStatus(err,stdout,stderr) {
		if(err){
			return err;
		}
		console.log('`isChangelogModified`: changelog modified:',Boolean(stdout));
		deferred.resolve(Boolean(stdout));
	});
	return deferred.promise;
}
function commitChangeLog(isDirty) {
	console.log('`commitChangeLog`:',isDirty);
	var deferred = Q.defer();
	if(isDirty){
		exec('git commit ' + paths.changelog + ' -m "Edit changelog for tag ' + pkg.version + '"', function commitChangelogCallback(err,stdout) {
			console.log(stdout);
			if(err){
				return err;
			}
			console.log('`commitChangeLog`: changelog committed');
			deferred.resolve();
		});
	}else{
		deferred.resolve();
	}
	return deferred.promise;
}
function createChangeLog(cb) {
	changelog({
		version:pkg.version,
		repository: pkg.repository.url
	},function changelogCallback(err, log) {
		gutil.log('Writing to changelog...')
		if(err){
			gutil.log(err);
			return cb(err);
		}
		if(fs.existsSync(paths.changelog)){
			fs.writeFile(paths.changelog, log, function writeChangelogCallback(err,res) {
				if(err){
					return cb(err);
				}
				gutil.log('Finished writing file `',paths.changelog,'`');
				cb();
			});
		}
	});
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
		.pipe(jscs())
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

/**
 *  Adds a path to amd-config.json for a convenient alias to the module.
 */
function registerAmdModule(dirName, moduleName){
	var config = require(paths.amdConfig);
	config.paths[dirName] = [dirName, moduleName].join('/');
	fs.writeFileSync(paths.amdConfig, stringify(config, {space: 4}));
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