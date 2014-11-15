# Getting started

* For boilerplate development: Fork and clone this repository.
* For scaffolding a project: Download this source and copy it into your project repository.

## Install dependencies

This project requires [NodeJS](http://nodejs.org/) and NPM (comes with NodeJS) for the development tools. Install those using:

	$ npm install

The front-end vendor components are managed with [Bower](http://bower.io/) and can be installed via:

	$ bower install

Bower is installed by npm with the project dependencies, so if you don't have bower installed globally / available in your path,
you can do:

	$ node ./node_modules/bower/bin/bower install

### Tasks

Gulp is used to automate project tasks. It's convenient to install gulp globally and be able to run commands from anywhere.

	$ npm install -g gulp-cli

But you can also run a gulp command when gulp is not installed globally

	$ node ./node_modules/gulp/bin/gulp.js {task}

## Develop

You can start a file watcher which rebuilds on every change and a development server which reloads on changes using:

    $ gulp watch

## Deploy

If you only want to create a new distribution without a watcher or a server you can run:

	$ gulp build_clean

If you want to check the build run `gulp serve` after it.

The front-end vendor components are managed with [Bower](http://bower.io/) and can be installed via:

	$ bower install
