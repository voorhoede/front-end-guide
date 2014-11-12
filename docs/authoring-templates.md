# Authoring templates

The front-end guide uses Mozilla's [Nunjucks](http://mozilla.github.io/nunjucks/) templating engine for enhanced templating features, like variables, [if statements](http://mozilla.github.io/nunjucks/templating.html#if), [for loops](http://mozilla.github.io/nunjucks/templating.html#for), template inheritance, template partials and [more](http://mozilla.github.io/nunjucks/templating.html). 


## Template variables

The front-end guide comes packed with a set of [variables](http://mozilla.github.io/nunjucks/templating.html#variables) which you can use in the templates using variable expressions `{{ var }}`:
	
* **`module`** is available in the context of a module, for example in `views/home/home.html` and has the following properties:
	* `type` - module type ("component" or "view")
	* `name` - module directory name, eg. `home`.
	* `html` - module HTML as string.
	
* **`moduleIndex`** is a list of all modules grouped by module type.
	* `moduleIndex.components` is a list of all components. 
	* `moduleIndex.views` is a list of all views. 
	* Each module (eg. `moduleIndex.components[0]`) has the following properties: 
		* `type` - module type ("component" or "view")
		* `name` - module directory name, eg. `app-header`.
		* `id` - unique slug based on module type directory plus module name, eg. `components/app-header`.
		* `path` - path to module's index.html file relative to web root.

* **`paths.root`** resolves to the relative web path to the `dist/` directory. Usage:

		<a href="{{ paths.root }}" rel="home">...</a>
		
		<a href="{{ path.root }}views/_style-guide/style-guide.html">...</a>

* **`paths.assets`** resolves to the relative web path to the `dist/assets/` directory. Usage:

		<img src="{{ paths.assets }}components/app-logo/demo-logo.svg" alt="demo">		
* **`pkg`** contains the JSON of [`package.json`](../package.json).


## Template inheritance

A template can [extend](http://mozilla.github.io/nunjucks/templating.html#extends) another template, using `{% extends "path/to/file.ext" %}`. The front-end guide mostly uses extends for views. In the front-end guide all paths are relative to `src/`. For example all views generated using `gulp create_module` extend the base-view: 

	{% extends "views/_base-view/base-view.html" %}
	
	
## Template partials

In the front-end guide component HTML is treated as template partials. These partials can be included in other templates using [`include`](http://mozilla.github.io/nunjucks/templating.html#include):

	{# in `src/views/_base-view/base-view.html`: #}
	{% include "components/app-header/app-header.html" %}

	
## Main view

To set the project's main view we extend the desired view in the main index template in [`src/index.html`](../src/index.html). By default, the guide-viewer is the main view:

	{# in `src/index.html`: #}
	{% extends "views/_guide-viewer/guide-viewer.html" %}
	
If you've created a custom home view and want to make this the main view simply change this to:

	{% extends "views/home/home.html" %}

	
## Default template

New modules can be generated using `gulp create_module`. Depending on the module type selected in this task, it creates a module based on the `src/components/_template/` or `src/views/_template/`. These directories contain the [component HTML template](../src/components/_template/template.html) and [view HTML template](../src/views/_template/template.html). You can modify these as you want. The `MODULE_NAME` constant is automatically substituted by the name of the new module.

## Render templates

All templates are rendered by running `gulp build_html`. If you want to author templates and see the changes live in the browser use `gulp watch`.