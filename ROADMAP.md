# Roadmap for front-end guide v1.0.0

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