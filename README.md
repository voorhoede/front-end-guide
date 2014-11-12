# Front-end Guide

[![Build Status](https://travis-ci.org/voorhoede/front-end-guide.svg?branch=master)](https://travis-ci.org/voorhoede/front-end-guide)
[![Dependency Status](https://david-dm.org/voorhoede/front-end-guide.svg?theme=shields.io)](https://david-dm.org/voorhoede/front-end-guide)
[![devDependency Status](https://david-dm.org/voorhoede/front-end-guide/dev-status.svg?theme=shields.io)](https://david-dm.org/voorhoede/front-end-guide#info=devDependencies)

Manage your front-end project in unique views and reusable components.

## Getting started

* For boilerplate development: Fork and clone this repository.
* For scaffolding a project: Download this source and copy it into your project repository.

### Install dependencies

This project requires [NodeJS](http://nodejs.org/) and NPM (comes with NodeJS) for the development tools. Install those using:

	$ npm install
    
The front-end vendor components are managed with [Bower](http://bower.io/) and can be install via:

	$ bower install

### Develop 

You can start a file watcher which rebuilds on every change and a development server which reloads on changes using:
 
    $ gulp watch

### Deploy

If you only want to create a new distribution without a watcher or a server you can run:
 
	$ gulp build_clean

If you want to check the build run `gulp serve` after it.


## Documentation

* [Build with Travis CI](docs/build-with-travis-ci.md)
* [Changelog](docs/changelog.md)
* [Versioning](docs/versioning.md)