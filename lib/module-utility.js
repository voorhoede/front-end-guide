var _ = require('lodash-node');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var Q = require('q');
var gulp = require('gulp');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var minimist = require('minimist');
var stringify = require('json-stable-stringify');
var paths = require('../config.js').paths;
var rimraf = require('rimraf');
var chalk = require('chalk');

var fileTypes = ['html','less','js','md'];

//questions

var questionSelectModuleList = {
	type: 'list',
	name: 'path',
	choices:function () {
		var index = getConsoleModuleIndex(getModuleIndex());
		return [new inquirer.Separator('=== COMPONENTS:')].concat(
			index.components
		).concat([new inquirer.Separator('=== VIEWS:')]).concat(
			index.views
		);
	}
};
var questionFileTypesToAdd = {
	type:'checkbox',
	name:'files',
	message:'Which file types would you like to add?',
	when:function (answers) {
		return Boolean(getMissingTypes(answers.path).length);
	},
	choices:function (answers) {
		return getMissingTypes(answers.path);
	}
};
var questionConfirmRemove = {
	type:'confirm',
	name:'remove',
	message:function (answers) {
		var moduleName = answers.path.split('/')[1];
		return 'are you sure you want to remove module ' + moduleName;
	},
	default: false
};
//questions for edit module method

var editQuestions = [
	//question 1: select from a list of existing modules
	questionSelectModuleList,
	//question 2: select from files not yet present in chosen module
	questionFileTypesToAdd
];
//questions for remove module task
var removeQuestions = [
	questionSelectModuleList,
	questionConfirmRemove
];
//questions for create module task
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
 * takes the output from getModuleIndex for use as items in inquirer list.
 *
 * @param {object} index
 * @returns {object} a transformed object
 */
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
 * @param path
 * @returns {{dir: *, files: *}}
 */
function getModuleStatusSync(path) {
	var result = fs.readdirSync(path);
	return {
		dir: path,
		files: result
	};
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
	var basePath = path.join(paths.src, module.type, '_template/*.');
	return gulp.src(module.files.map(function (type) {
		return basePath + type;
	}))
		.pipe(replace(/MODULE_NAME/g, module.name))
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
	return inquire(questions()).then(function (answers) {
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
				module.files = getMissingFileTypes(module.files, status.files);
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
			return module;
		});
	}).then(function (module) {
		console.log(chalk.bold.green('Successfully created module', module.name));
	},function (error) {
		console.log(chalk.bold.red(error));
	});
}
/**
 * prompts user for files to add to module of his/her choosing
 * @returns {object} Promise
 */
function editModule() {
	questionSelectModuleList.message = 'Select a module to add files to';
	return inquire(editQuestions).then(function (answers) {
		var files = answers.files,
			pathComponents = answers.path.split('/'),
			module = {};
		if(!files || !files.length){
			throw new Error('Can not add files!');
		}
		module.files = addTestFile(files);
		module.path = resolveModuleDir(pathComponents[0],pathComponents[1]);
		module.type = pathComponents[0];
		module.name = pathComponents[1];
		copyTemplateFiles(module);
		return registerAmdModule(module.type, module.name);
	}).then(function () {
		console.log(chalk.bold.green('Successfully edited module'));
	},function (error) {
		console.log(chalk.bold.red(error));
	});
}
/**
 * prompts user for module removal
 * @returns {object} Promise
 */
function removeModule() {
	questionSelectModuleList.message = 'Select the module to remove';
	return inquire(removeQuestions).then(function (answers) {
		if(!answers.remove){
			return;
		}
		var path = answers.path.split('/');
		var dir = resolveModuleDir.apply(null, path);
		return Q.nfcall(rimraf, dir).then(function () {
			unRegisterAmdModule.apply(null, path);
			return 'Successfully deleted ' + answers.path;
		});
	}).then(function (result) {
		if(result){
			console.log(chalk.bold.green(result));
		}
	},function (err) {
		console.log(chalk.bold.red('error deleting module:',err));
	});
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
 *  Adds a path to amd-config.json for a convenient alias to the module.
 *  @param {string} moduleType
 *  @param {string} moduleName
 */
function registerAmdModule(moduleType, moduleName){
	var config = require('../' + paths.amdConfig),
		alias = path.join(moduleType, moduleName),
		location = path.join(alias, moduleName);

	config.paths[alias] = location;
	fs.writeFileSync(path.resolve(paths.amdConfig), stringify(config, {space: 4}));
}
/**
 *  Remove a path from amd-config
 *  @param {string} moduleType
 *  @param {string} moduleName
 */
function unRegisterAmdModule(moduleType, moduleName) {
	var config = require('../' + paths.amdConfig),
		alias = path.join(moduleType, moduleName);
	delete config.paths[alias];
	fs.writeFileSync(path.resolve(paths.amdConfig), stringify(config, {space: 4}));
}

function getMissingTypes(dirPath) {
	var dir = resolveModuleDir.apply(null, dirPath.split('/')),
		files = getModuleStatusSync(dir).files,
		exts = files.filter(function (file) {
			return Boolean(file);
		}).map(function (file) {
			return path.extname(file).slice(1);
		});
	return fileTypes.filter(function (type) {
		return exts.indexOf(type) < 0;
	});
}
module.exports = {
	create: createModule,
	remove: removeModule,
	edit: editModule,
	getModuleIndex: getModuleIndex
};