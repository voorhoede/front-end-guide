var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var Q = require('q');

/**
 * Create a component or a view with files depending on user feedback through inquirer.
 * if the view or components includes JS, its mapping is added to AMD config.
 * https://www.npmjs.org/package/inquirer
 */
function createModulePrompt(cb){
	var moduleType, moduleName, modulePath;

	inquirer.prompt(questions, function createModule(answers) { // callback to inquirer.prompt.
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
			.pipe(gulp.dest(modulePath));

		if(answers.files.indexOf('js') >= 0){
			registerAmdModule(moduleDir, moduleName);
		}
		gutil.log(['Successfully created', moduleName, moduleType].join(' '));
		cb();
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
var questions = [{
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
}];