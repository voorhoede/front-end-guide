# Front-end Guide

[![Build Status](https://travis-ci.org/voorhoede/front-end-guide.svg?branch=master)](https://travis-ci.org/voorhoede/front-end-guide)
[![Dependency Status](https://david-dm.org/voorhoede/front-end-guide.svg?theme=shields.io)](https://david-dm.org/voorhoede/front-end-guide)
[![devDependency Status](https://david-dm.org/voorhoede/front-end-guide/dev-status.svg?theme=shields.io)](https://david-dm.org/voorhoede/front-end-guide#info=devDependencies)

Manage your front-end project in unique views and reusable components.

## Kick start

Create your project folder and add a `package.json`. This can be done with:

    $ npm init

**Install all dependencies**

    $ npm install front-end-guide gulp --save-dev
    $ npm install gulp -g

If you are running this on an empty folder it’s recommended to get the scaffolding files. You can do this by running:

    $ ./node_modules/.bin/front-end-guide

If you installed it globally then you can run

    $ front-end-guide

## Available Tasks

**Deploy locally**

    $ gulp build_guide
    $ gulp serve

**Develop**

This will do the same as above and also watch files for changes and livereload

    $ gulp watch

**Optimize images**

This will optimize **new** images on the assets-raw folder and copy them to assets/images

	$ gulp imagemin

## Documentation

* [Authoring templates (HTML)](docs/authoring-templates.md)
* [Authoring styles (LESS/CSS)](docs/authoring-styles.md)
* [Authoring scripts (JS)](docs/authoring-scripts.md)
* [Authoring assets](docs/authoring-assets.md)
* [Creating modules](docs/module-crud.md)

## Configurable options

**You can pass your [autoprefix options](https://github.com/postcss/autoprefixer#browsers):**

    guide.tasks.buildLess(
        {
            autoPrefixBrowsers : ['> 1%', 'last 2 versions']
        }
    );


**If you don't want to minify your output:**

    guide.tasks.buildJs(
        {
            sourceMaps: false,
            uglify: 'none'
        }
    );

**If you want to change your raw images directory**

    guide.tasks.runImagemin(
        {
            rawImagePath : 'assets-raw/images'
        }
    ;)

## Writing README files

README files are written with Markdown. Code blocks are syntax-highlighted with Prism. Currently we support four basic languages (C-like, CSS, "Markup", JavaScript).
