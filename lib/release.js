var chalk = require('chalk');
var exec = require('child_process').exec;
var inquirer = require('inquirer');
var pkg = require('../package.json');
var Q  = require('q');
var semver = require('semver');
var allowedIncrements = /^(major|minor|patch)$/;
var errorStyle = chalk.bold.red;
var successStyle = chalk.bold.blue;
var questions = [
	{
		type:'list',
		name:'semver',
		choices:[
			'major',
			'minor',
			'patch'
		].map(function (inc) {
				return versionIncrement(pkg.version, inc);
			}),
		message:'Specify type of version bump.'
	},{
		type:'input',
		name:'message',
		message:'Enter a commit message for the tag (%s translates to version number)',
		default:'%s'
	},{
		type:'confirm',
		name:'pushTag',
		message: 'Do you want to push the new new tag to the repository\'s remote?',
		default:false
	}
];
/**
 * Checks if working directory is clean, not counting untracked files.
 *
 * @returns {Promise.promise|*}
 */
function checkCleanWorkingDirectory() {
	return Q.nfcall(exec, 'git status --short --untracked-files=no').then(function (modifications) {
		if(!hasTruthyValue(modifications)){
			return true;
		}
		throw new Error('working directory is not clean');
	},function (err) {
		throw new Error('error getting git status: ' + err);
	});
}
/**
 * checks if any value in the given array is truthy.
 *
 * @param {Array} collection
 * @returns {boolean}
 */
function hasTruthyValue(collection) {
	return Boolean(collection.reduce(function (previous, current) {
		return previous + current;
	}));
}
/**
 * get a choise for version increment question to use in prompt.
 *
 * @param currentVersion
 * @param increment
 * @returns {Object}
 */
function versionIncrement(currentVersion, increment) {
	return {
		name: [increment,
			[currentVersion, semver.inc(currentVersion, increment)].join(' -> ')
		].join(': '),
		value: increment
	};
}
/**
 * Inquirer prompts user and returns an array of answers
 *
 * @param {Array} questions prompt to user
 * @param {String} increment semver version increment
 */
function askQuestions(questions, increment) {
	var deferred = Q.defer(),
		inquiry = increment ? questions.slice(1) : questions;
	inquirer.prompt(inquiry, function (answers) {
		if(increment){
			answers.semver = increment;
		}
		deferred.resolve(answers);
	});
	return deferred.promise;
}
/**
 * Execute npm version command, which commits a new tag with the user specified commit message
 *
 * @param {Array} answers
 * @param {String} increment
 * @returns {Promise.promise|*}
 */
function bumpVersion(answers, increment) {
	var command = [
		'npm version',
		answers.semver,
		'-m',
			'"'+ answers.message +'"'
	].join(' ');
	return Q.nfcall(exec, command);
}
/**
 * Push the locally committed tag to the remote.
 * @returns {Promise.promise|*}
 */
function pushTags() {
	return Q.nfcall(exec, 'git push --tags --dry-run');
}
/**
 * you can call the bump script from command line with a first argument of major|minor|patch
 * to indicate increment. this will skip the first question, which is asked when run without cli
 * argument or when run from npm task. the npm task does not accept any command line args.
 */
module.exports = function (increment) {

	increment = increment.toLowerCase();

	if (increment && !allowedIncrements.test(increment)) {
		console.log(errorStyle('Disallowed value for version increment:', increment));
		return;
	}

	return checkCleanWorkingDirectory()
		.then(function () {
			return askQuestions(questions, increment);
		})
		.then(function (answers) {
			return bumpVersion(answers)
				.then(function () {
					if (answers.pushTag) {
						return pushTags();
					}
				}
			);
		})
		.fail(function reportError(error) {
			console.log(errorStyle(error));
			throw new Error();
		}
	).then(function endGood() {
			console.log(successStyle('Successfully completed release task'));
			process.exit();
		}, function endBad() {
			console.log(errorStyle('Unable to complete release task'));
		});
}(process.argv.slice(2, 3).join());