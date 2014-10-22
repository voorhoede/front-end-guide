var changelog = require('conventional-changelog');
var Q  = require('q');
var minimist = require('minimist');
var exec = require('child_process').exec;
var inquirer = require('inquirer');
var pkg = require('../package.json');
var fs = require('fs');
var paths = {
	changelog: 'CHANGELOG.md'
};

/**
 * Checks if working directory is clean, not counting untracked files.
 *
 * @returns {Promise.promise|*}
 */
function checkCleanWorkingDirectory() {
	var deferred = Q.defer();
	exec('git status --short --untracked-files=no', function getChangelogGitStatus(err,stdout,stderr) {
		if(err || stdout){
			deferred.reject(err || 'Working directory is not clean! Commit or revert before proceeding');
		}
		deferred.resolve(Boolean(stdout));
	});
	return deferred.promise;
}
/**
 * Inquirer prompts user and returns an array of answers
 */
function askQuestions() {
	var deferred = Q.defer();
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
	],function answersCallback(answers) {
		deferred.resolve(answers);
	});
	return deferred.promise;
}

/**
 * Execute npm version command, which commits a new tag with the user specified commit message
 *
 * @param {Array} answers
 * @returns {Promise.promise|*}
 */
function bumpVersion(answers) {
	var deferred = Q.defer();
	var command = [
		'npm version',
		answers.semver,
		'-m',
		'"'+ answers.message +'"'
	].join(' ');
	exec(command, function bumpCallback(err) {
		if(err){
			deferred.reject(err);
		}
		deferred.resolve();
	});
	return deferred.promise;
}
/**
 * Commit the changelog markdown file edited by conventional-changelog
 *
 * @returns {Promise.promise|*}
 */
function commitChangeLog() {
	var deferred = Q.defer();
	exec('git commit ' + paths.changelog + ' -m "Edit changelog for tag ' + pkg.version + '"', function commitChangelogCallback(err, stdout) {
		if (err) {
			deferred.reject(err);
		}
		deferred.resolve();
	});
	return deferred.promise;
}

/**
 * Fires the conventional changelog command, creating a new changelog with recently added features.
 *
 * @returns {Promise.promise|*}
 */
function updateChangelog() {
	var deferred = Q.defer();

	changelog({
		version:pkg.version,
		repository: pkg.repository.url
	},function changelogCallback(err, log) {
		if(err){
			deferred.reject(err);
		}
		if(fs.existsSync(paths.changelog)){
			fs.writeFile(paths.changelog, log, function writeChangelogCallback(err,res) {
				if(err){
					deferred.reject(err);
				}
				deferred.resolve();
			});
		}else{
			deferred.resolve();
		}
	});
	return deferred.promise;
}
/**
 * Push the locally committed tag to the remote.
 *
 * @param {Boolean} okToPush
 * @returns {Promise.promise|*}
 */
function pushTags(okToPush) {
	var deferred = Q.defer();
	if(okToPush){
		exec('git push --tags --dry-run', function gitPushCallback(err,stdout,stderror) {
			if(err){
				deferred.reject(err);
			}
			deferred.resolve();
		});
	}else{
		deferred.resolve();
	}
	return deferred.promise;
}

module.exports = (function () {
	checkCleanWorkingDirectory()
		//if working directory is clean, proceed with prompting the user, otherwise warn in console.
		.then(askQuestions)
		.then(function (answers) {
			//update the changelog
			updateChangelog()
				//commit the changelog
				.then(commitChangeLog)
				.then(function () {
					//increase package.json version, tag and commit
					bumpVersion.call(null, answers);
				})
				//if requested, push tags to the server
				.then(function () {
					pushTags.call(null, answers.pushTag);
				});
		}).then(function () {
			console.log('pushed tags to remote server');
		})
		//report error if one occurred.
		.fail(console.warn);
}());