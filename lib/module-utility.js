var _ = require('lodash-node');
var fs = require('fs');
var globs = require('glob-stream');
var inquirer = require('inquirer');
var path = require('path');
var Q = require('q');
var exec = require('child_process').exec;
var gulp = require('gulp');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var through = require('through2');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var minimist = require('minimist');
var stringify = require('json-stable-stringify');
var paths = require('../config.js').paths;
/**
 *
 * @param {array} questions - objects containing questions to ask in prompt
 * @param {...object} questionOverride - overrides questions in questions array
 */
function inquire(questions){
	var deferred = Q.defer(),
		overrides;
	if(!questions || !questions.length){
		deferred.reject('no questions asked');
	}
	overrides = [].slice.call(arguments, 1);
	questions  = !overrides.length ? questions : skipQuestions(questions, overrides.map(function (override) {
		return override.name;
	}));
	inquirer.prompt(questions, function promptCallback(answers) {
		deferred.resolve(replaceAnswers.apply(null, [answers].concat(overrides)));
	});
	return deferred.promise;
}
/**
 * removes questions
 * @param {array} questions - original array of questions
 * @param {...string|array} names properties of questions to remove from questions array
 */
function skipQuestions(questions) {
	var filters,
		rest = [].slice.call(arguments, 1),
		firstArg = rest.slice().shift();

	filters = Array.isArray(firstArg) ? firstArg : rest;
	return questions.filter(function (question) {
		return filters.indexOf(question.name) < 0;
	});
}
/**
 * replaces answers in given object with replacements
 * @param {object} answers
 * @param {...object} replacements
 *
 */
function replaceAnswers(answers) {
	if(Array.isArray(answers) || typeof answers !== 'object'){
		throw new Error('`answers` argument should be an Object');
	}
	var replacements,
		rest = [].slice.call(arguments, 1),
		firstArg = rest.slice().shift();

	replacements =  Array.isArray(firstArg) ? firstArg : rest;
	if(!replacements.length){
		return answers;
	}
	return _.merge(answers, replacements.reduce(function (prev,curr) {
		var next = {};
		var nextName = curr.name;
		if(nextName) {
			next[nextName] = curr.value;
		}
		return _.assign(prev, next);
	},{}));
}
/**
 * checks if then given module exists and returns its path and an array of file names it contains if
 * it does exists, false if it doesn't
 * @param {string} path
 * @returns {object|boolean}
 */
function getModuleStatus(path){
	return Q.nfcall(fs.readdir, path).then(function (result) {
		return {
			dir:path,
			files:result
		};
	},function () {
		return false;
	});
}
/**
 * returns the file types that do not exist in a module
 *
 * @param {array} fileTypes - files the user requested
 * @param {array} fileNames - base paths that already exist in the module
 * @returns {array} - file extensions the user requested which were not found in the base paths
 */
function getMissingFileTypes(fileTypes, fileNames) {
	if(!Array.isArray(fileTypes)){
		throw new Error('`fileTypes` argument should be an Array');
	}else if(!Array.isArray(fileNames)){
		throw new Error('`moduleStatus` argument should be an Object');
	}
	return addTestFile(fileTypes).filter(function (type) {
		return fileNames.map(function (file) {
				var extension;
				if(!/test/g.test(file)){
					extension = path.extname(file);
				}else{
					extension = '.test.js';
				}
			return extension.substr(1);
		}).indexOf(type) < 0;
	});
}
/**
 * glob search skips '.test.js', so insert the js test file extension here if a js file is found.
 * @param {array} fileTypes
 * @returns {array}
 */
function addTestFile(fileTypes) {
	var adjustedTypes;
	if(fileTypes.indexOf('js') >= 0){
		adjustedTypes = fileTypes.slice();
		adjustedTypes.push('test.js');
		return adjustedTypes;
	}
	return fileTypes;
}
/**
 * returns a module's normalized absolute path
 *
 * @param {String} moduleName
 * @param {String} moduleType
 * @returns {String}
 */
function resolveModuleDir(moduleType, moduleName) {
	return path.resolve(
		path.join(paths.src, moduleType, moduleName)
	);
}
/**
 * create a directory at given path
 * @param {string} path
 * @returns {object} a promise representing the result of directory creation
 */
function createModuleDir(path){
	return Q.nfcall(fs.exists, path).then(function () {
		return Q.nfcall(fs.mkdir, path);
	},function (err) {
		throw new Error('directory already exists!');
	});
}
/**
 *
 * @param {object} module - information about the module to create
 * @returns {*}
 */
function copyTemplateFiles(module) {
	//remove the 's' for a friendly type description in the output files
	var moduleType = module.type.substr(0, module.type.length - 1);
	return gulp.src(module.files.map(function (type) {
		return paths.templateRoot + '/*.' + type;
	}))
		.pipe(replace(/MODULE_NAME/g, module.name))
		.pipe(replace(/MODULE_TYPE/g, moduleType))
		.pipe(rename(function(p){
			var isTest = /test$/.test(p.basename);
			if(p.basename !== 'README' && !isTest){ p.basename = module.name; }
			if(isTest){
				p.basename = module.name;
				p.extname = '.test' + p.extname;
			}
		}))
		.pipe(gulp.dest(module.path));
}
/**
 * prompt the user for module creation.
 * @param {...object} object(s) representing questions to skip / answers to replace
 * todo: get args (use minimist)
 */
function createModule() {
	//ask what to create
	inquire(questions()).then(function (answers) {
		var module = {
			name:	answers.moduleName,
			type:	answers.moduleType,
			files:	answers.files,
			path:	resolveModuleDir(answers.moduleType, answers.moduleName)
		};
		//check if the module already exists
		return getModuleStatus(module.path).then(function (status) {
			//the module already exists, create files that don't exist yet
			if(status){
				module.files = getMissingFileTypes(module.files, status.files)
				return module;
			}
			//the module does not exist yet: create a directory for it
			return createModuleDir(module.path).then(function () {
				return module;
			});
		}).then(function (module) {
			//copy files from template directory to new module
			copyTemplateFiles(module);
			if(module.files.indexOf('js') >= 0){
				registerAmdModule(module.type, module.name);
			}
		});
	}).catch(function (e) {
		console.log(e);
	});
}
function editModule() {

}
function listDirectories(cwd) {
	return fs.readdirSync(cwd)
		.filter(function(file){
			return fs.statSync(cwd + file).isDirectory();
		});
}
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
/**
 * Create a component or a view with files depending on user feedback through inquirer.
 * if the view or components includes JS, its mapping is added to AMD config.
 * https://www.npmjs.org/package/inquirer
 */
function createModulePrompt(){
	inquirer.prompt(questions(), function createModule(answers) { // callback to inquirer.prompt.
		var moduleType = answers.moduleType;
		var moduleName = answers.moduleName;
		var moduleDir  = [moduleType, moduleName].join('s/');

		console.log(moduleType, moduleName, moduleDir);
		gulp.src(answers.files.map(function (extName) {
			return [paths.src, moduleType + 's/', '_template.', extName].join('');
		}))
			.pipe(replace(/MODULE_NAME/g, moduleName))
			.pipe(rename(function(p){
				if(p.basename !== 'README'){ p.basename = moduleName; }
			}))
			.pipe(gulp.dest(modulePath));

		if(answers.files.indexOf('js') >= 0){
			registerAmdModule(moduleDir, moduleName);
		}
		console.log(['Successfully created', moduleName, moduleType].join(' '));
	});
}
/**
 *  Adds a path to amd-config.json for a convenient alias to the module.
 */
function registerAmdModule(moduleType, moduleName){
	var config = require('../' + paths.amdConfig),
		alias = path.join(moduleType, moduleName),
		location = path.join(alias, moduleName);

	config.paths[alias] = location;
	fs.writeFileSync(path.resolve(paths.amdConfig), stringify(config, {space: 4}));
}
var questions = function () {
	var moduleType, moduleName, modulePath;
	return [{
		type: 'list',
		name: 'moduleType',
		message: 'What kind of module would you like to create?',
		choices:[{
			name: 'component',
			value: 'components'
		},{
			name:'view',
			value: 'views'
		}]
	},{
		type: 'input',
		name: 'moduleName',
		message: 'Give the new module a name',
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
	}];
};
var editQuestions = function () {
	//question 1: select from a list of existing modules
	var questions = [
		{
			type: 'list',
			name: 'path',
			message: 'select a component to add to',
			choices:function () {
				var index = getConsoleModuleIndex(getModuleIndex());
				return [new inquirer.Separator('=== COMPONENTS:')].concat(
					index.components
				).concat([new inquirer.Separator('=== VIEWS:')]).concat(
					index.views
				);
			}
		}
	];
	return questions;
};

function getConsoleModuleIndex(index) {
	return Object.keys(index).map(function (type) {
		var section = {};
		section[type] = index[type].map(function (module) {
			return {
				name: module.name,
				value: module.id
			};
		});
		return section;
	}).reduce(function (prev,curr) {
		var keys = Object.keys(curr);
		prev[ keys[0] ] = curr[ keys[0] ];
		return prev;
	},{});
}


module.exports = {
	create: createModule,
	remove: function () { console.log('todo: write remove component task'); },
	edit: editModule,
	//these methods are exposed for unit testing purposes
	skipQuestions: skipQuestions,
	replaceAnswers: replaceAnswers,
	getModuleIndex: getModuleIndex,
	listDirectories: listDirectories,
	getMissingFileTypes: getMissingFileTypes
}