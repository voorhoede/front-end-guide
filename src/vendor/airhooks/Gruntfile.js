module.exports = function (grunt) {
	'use strict';

	var metaFiles = ['bower.json', 'package.json'];
	grunt.config.init({
		bump: {
			options: {
				files: metaFiles,
				updateConfigs: [],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: metaFiles,
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%'
			}
		}
	});

	// Load all npm installed grunt tasks.
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// load all project grunt tasks.
	grunt.registerTask('default', ['']);
};
