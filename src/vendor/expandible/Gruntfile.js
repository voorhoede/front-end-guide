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
				push: true,
				pushTo: 'origin',
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%'
			}
		},
		requirejs: {
			distribution: {
				options: {
					baseUrl: '',
					name: 'bower_components/almond/almond', // relative to baseUrl, assumes a production build using almond
					include: ['expandible'],
					insertRequire: ['expandible'],
					out: 'expandible.min.js',
					optimize: 'uglify2',
					paths: {
						airhooks: 'bower_components/airhooks/airhooks'
					}
				}
			}
		}
	});

	// Load all npm installed grunt tasks.
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', ['requirejs']);
};
