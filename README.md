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

### Previews

todo: write about it.

### Versioning

Semantic versioning is used to keep track of changes in the project, in accordance with 
[Semantic Versioning 2.0.0](http://semver.org/). You find the current version of the project in 
`package.json` in the property ***version***. A task to increase the version number is included for
your convenience: `./lib/release.js`. This task will also create a tagged commit and push to origin
if you choose to do so. You can run this task like so: `node ./lib/release.js [increment]`. 
***increment*** can be either patch, minor or major. 
	- If you don't enter an increment argument, the task will prompt you for the type of increment. 
	- After specifying the increment, you'll have the opportunity to write a commit message. The default 
value is the new version number, which you can include by typing `%s` in the body.
	- After confirming the commit message, you'll be asked if you want to push the newly created tag to
the repository's remote. By default, nothing will be pushed.

If you decide go for the push option, the tag will be pushed to repository's remote. The command
that is executed to accomplish this, is `git push --tags`. Meaning that only the tag(s) will be pushed. 
Other (regular) commits will still have to be pushed "manually".

*Release* is also availabe as npm task. You execute it like this: `npm run release[:increment]`.
Again, calling this task without an argument, will start a prompt asking you for the intended
version increment.

> Notice: the release task will only be able to do its thing when your working directory is clean. 
> If it's not, the task will fail with an error.

### Changelog

in `CHANGELOG.md` you'll find an overview of features and bug fixes. Every time you intend to 
release a new version (tag), you should update the changelog to include what has been done between 
the last time a version was released and the current HEAD commit. 

> If the package version for the is not different from the first tag heading found in the changelog, 
> the log will not be written.

Commit messages must adhere to the format described in [this](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/)
document to be parsed in the changelog. The npm task `npm run changelog` appends the relevant 
commits to the file CHANGELOG.md (only feat and fix are included), creating the file if it does not 
yet exist. This script's location is `lib/changelog.js`. 

After generating the changelog, you have the opportunity to modify it as you see fit. Do 
however refrain from editing the heading that displays the version. Example:
> \#\# 0.0.1 (2014-11-05)

This heading is used as a reference point to check if an update of the log needs to take place. If you
mess with it, expect to see duplicate entries in the changelog.

When you're done editing, you can commit the changes to the log and do `npm run release` to create 
and optionally push a tagged commit.

### Build with Travis CI

A (public) Github repository can easily be build automatically with [Travis CI](https://travis-ci.org):

1. [Enable your project in Travis CI](https://travis-ci.org/getting_started). 
2. [Configure Travis](http://docs.travis-ci.com/user/build-configuration/#.travis.yml-file%3A-what-it-is-and-how-it-is-used) using `.travis.yml` to automatically run our tests and create a build:

		# .travis.yml
		language: node_js
		node_js:
		- '0.10'
		before_install:
		- npm install -g bower
		- bower install
    	script: npm run test && npm run build

#### Automatically deploy to Github Pages

We can use Travis to automatically publish our build to [Github Pages](https://pages.github.com/).
Whenever changes are pushed to a Github repository's gh-pages branch, Github automatically deploys these.

1. [Create a gh-pages branch](https://help.github.com/articles/creating-project-pages-manually/).
2. [Generate an access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/). Since we don't want to manually update this branch every time we make changes, we'll use Travis to automate this. We'll use the token to grant Travis permission to push to our project's repository. Tip: Store the token somewhere safe.
3. [Install Travis encrypter](http://docs.travis-ci.com/user/encryption-keys/) by running `gem install travis`. We need to encrypt our token to keep it safe.
4. **Encrypt the gh-token** and add it to your configure file by running:

		travis encrypt -r username/projectname GH_TOKEN=YoUrToKeN1VZHg5PRfEeRS4F8NbtmuTbTX8kQ3yG --add env.global
		
	Your `.travis.yml` should now contain an `env.global.secure` value.
		
5. **Trigger deploy to gh-pages**. The `lib/travis-to-gh-pages.sh` uses the encrypted token to push Travis build to the gh-pages branch. To trigger this script we add this to our Travis configuration:
	
		# .travis.yml
		# ...
    	script: npm run test && npm run build && ./lib/travis-to-gh-pages.sh
    	env:
    	  global:
    	    secure: eNcRyPtEdGhToKeNaSaVeRyLoNgStRiNg
    	    
    Note: The deploy script also generates a README with a link to the published project on username.github.io/projectname.
    
    Note: By default [Github Pages ignores all files and directories starting with an underscore](https://help.github.com/articles/files-that-start-with-an-underscore-are-missing/). To prevent this the deploy script adds a `.nojekyll` file to gh-pages.



## To Do

* [ ] **Documentation**
	* [ ] How to use app?
	* [ ] How to create views & components?
	* [ ] How to manage vendor components?
	* [ ] How to create new release?
	* [ ] How to change or extend automated tasks?
	* [X] How to automatically build distribution with Travis

* [ ] **App structure**
	* [X] Source files by module type: `components`, `views`, `vendor`.
	* [X] Manage vendor components via `bower`.
	* [X] Simplify naming to {moduleName}/{moduleName}.(html|js|less).
	* [X] Abstract module convention (prefix `_` to module directory.
	* [X] Add component generator (wizard? use HTML, LESS, JS, ...?)
	* [X] Add view generator (wizard?)

* [ ] **Static assets** (fonts, images, ...)
	* [X] Copy assets from `src/assets/*` and `src/{moduleType}/{moduleName}/assets/*` to `dist/assets/{moduleType}/{moduleName}`.
	* [ ] Optimize assets (minify images, ...)?
	* [X] Setup assets watcher.

* [ ] **HTML Templates**
	* [X] Implement Nunjucks templating engine.
	* [X] Setup components as reusable partials (`{% include "components/..." %}`) & extensible views (`{% extends "views/..." %}`).
	* [X] Generate module index with links to views & components.
	* [X] Make package(.json) info available as data (eg. `{{ pkg.name }}`).
	* [X] Make module info (name, type, ...) available as data (eg. `{{ module.name }}`, `{{ module.html }}`).
	* [X] Setup HTML template watcher.
	* [X] Generate HTML Previews.
	* [X] Build component viewer, with component preview, readme and highlighted syntax of component files (html, css, js).

* [ ] **Stylesheets**
	* [X] Setup LESS compiler.
	* [X] Setup autoprefixer.
	* [X] Setup LESS/CSS sourcemaps.
	* [ ] Setup CSS minification.
	* [X] Setup LESS watcher.
	* [ ] Setup LESS linter using external `.recessrc` file?
	
* [ ] **JavaScripts**
	* [X] Setup AMD/RJS Optimizer (with UMDJS pattern support).
	* [X] Setup JS sourcemaps.
	* [X] Setup JS watcher.
	* [X] Setup JS hinting using external `.jshintrc` file.
	* [X] Setup JS Code Style check using external `.jscs.json` file. See [JSCS rules](https://github.com/jscs-dev/node-jscs#rules)
	* [ ] Setup task to build individual optimized module scripts? (eg. `dist/components/search-menu/search-menu.min.js`)
	
* [ ] **Deployment**
	* [X] Task for bumping versions? (json meta files, create git tag)
	* [X] Task for updating changelog?
	* [ ] Task for archiving distribution to `.zip`?
	* [ ] Example `.travis.yml` to deploy to GitHub Pages?
	
## Issues

* Only LESS files directly in module folders are watched but not in sub folders (`like components/app-core-styles/styles/*`).
* Modules should be watched and compiled individually?
* Move README sections into separate files in `docs/`?
* Move TO DO list to Github Issues?