# Front-end Guide

[![Dependency Status](https://david-dm.org/jbmoelker/front-end-guide.svg?theme=shields.io)](https://david-dm.org/jbmoelker/front-end-guide)
[![devDependency Status](https://david-dm.org/jbmoelker/front-end-guide/dev-status.svg?theme=shields.io)](https://david-dm.org/jbmoelker/front-end-guide#info=devDependencies)

Manage your front-end project in unique views and reusable components.

## Getting started

* For boilerplate development: Fork and clone this repository.
* For scaffolding a project: Download this source and copy it into your project repository.

### Install dependencies

This project requires [NodeJS](http://nodejs.org/) and NPM (comes with NodeJS) for the development tools. Install those using:

	$ npm install
    
The front-end vendor components are managed with [Bower](http://bower.io/) and can be isntall via:

	$ bower install

### Develop 

You can start a file watcher which rebuilds on every change and a development server which reloads on changes using:
 
    $ gulp watch

### Deploy

If you only want to create a new distribution without a watcher or a server you can run:
 
	$ gulp build_clean

If you want to check the build run `gulp serve` after it.


## To Do

* [ ] **Documentation**
	* [ ] How to use app?
	* [ ] How to create views & components?
	* [ ] How to manage vendor components?
	* [ ] How to create new release?
	* [ ] How to change or extend automated tasks?

* [ ] **App structure**
	* [X] Source files by module type: `components`, `views`, `vendor`.
	* [X] Manage vendor components via `bower`.
	* [X] Simplify naming to {moduleName}/{moduleName}.(html|js|less).
	* [X] Abstract module convention (prefix `_` to module directory.
	* [ ] Add component generator (wizard? use HTML, LESS, JS, ...?)
	* [ ] Add view generator (wizard?)

* [ ] **Static assets** (fonts, images, ...)
	* [X] Copy assets from `src/assets/*` and `src/{moduleType}/{moduleName}/assets/*` to `dist/assets/{moduleType}/{moduleName}`.
	* [ ] Optimize assets (minify images, ...)?
	* [ ] Setup assets watcher.

* [ ] **HTML Templates**
	* [X] Implement Nunjucks templating engine.
	* [X] Setup components as reusable partials (`{% include "components/..." %}`) & extensible views (`{% extends "views/..." %}`).
	* [X] Generate module index with links to views & components.
	* [X] Make package(.json) info available as data (eg. `{{ pkg.name }}`).
	* [ ] Make module info (name, type, ...) available as data (eg. `{{ module.name }}`, `{{ module.css }}`).
	* [X] Setup HTML template watcher.
	* [ ] Generate HTML Previews.

* [ ] **Stylesheets**
	* [X] Setup LESS compiler.
	* [X] Setup autoprefixer.
	* [ ] Setup LESS/CSS sourcemaps.
	* [X] Setup LESS watcher.
	* [ ] Setup LESS linter using external `.recessrc` file?
	
* [ ] **JavaScripts**
	* [X] Setup AMD/RJS Optimizer (with UMDJS pattern support).
	* [X] Setup JS sourcemaps.
	* [X] Setup JS watcher.
	* [X] Setup JS hinting using external `.jshintrc` file.
	* [ ] Setup JS Code Style check using external `.jscs.json` file. See [JSCS rules](https://github.com/jscs-dev/node-jscs#rules)
	
* [ ] **Deployment**
	* [ ] Task for bumping versions? (json meta files, create git tag)
	* [ ] Task for updating changelog?
	* [ ] Task for archiving distribution to `.zip`?
	* [ ] Example `.travis.yml` to deploy to GitHub Pages?
	
## Issues

* LESS/CSS sourcemaps should be external files.
* Modules should be watched and compiled individually?
* `jshintSrcTask` should be renamed as now also includes `jscs()`.