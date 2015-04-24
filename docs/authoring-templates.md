# Authoring templates

The front-end guide uses Mozilla's [Nunjucks](http://mozilla.github.io/nunjucks/) templating engine for module based development with enhanced templating features, like variables, [if statements](http://mozilla.github.io/nunjucks/templating.html#if), [for loops](http://mozilla.github.io/nunjucks/templating.html#for), template inheritance, template partials and [more](http://mozilla.github.io/nunjucks/templating.html). 


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

	```html
	
		<a href="{{ paths.root }}" rel="home">...</a>
		
		<a href="{{ path.root }}views/_style-guide/style-guide.html">...</a>
	```

* **`paths.assets`** resolves to the relative web path to the `dist/assets/` directory. Usage:

	```html
	
		<img src="{{ paths.assets }}components/app-logo/demo-logo.svg" alt="demo">
	```
			
* **`pkg`** contains the JSON of [`package.json`](../package.json).


## Template inheritance

A template can [extend](http://mozilla.github.io/nunjucks/templating.html#extends) another template, using `{% extends "path/to/file.ext" %}`. The front-end guide mostly uses extends for views. In the front-end guide all paths are relative to `src/`. For example all views generated using `gulp create_module` extend the base-view: 

	{% extends "views/_base-view/base-view.html" %}
	
	
## Template partials

In the front-end guide component HTML is treated as template partials. These partials can be included in other templates using [`include`](http://mozilla.github.io/nunjucks/templating.html#include):

	{# in `src/views/_base-view/base-view.html`: #}
	{% include "components/app-header/app-header.html" %}
	
### Template partial variations

To reuse a template partial in different variations you can use [`macro`](http://mozilla.github.io/nunjucks/templating.html#macro)s. A macro is a function block which accepts variables:

	{# in `src/components/custom-input/custom-input.html`: #}
	{% macro customInput(label, name, isRequired=false) %}
		<label for="input-{{ name }}">{{ label }}</label>
		<input  id="input-{{ name }}" name="{{ name }}" {% if isRequired %}required{% endif %}>
	{% endmacro %}
	
You can use the macro by [`import`](http://mozilla.github.io/nunjucks/templating.html#import)ing it in a template and calling it within an expression: 

	{# in `src/views/custom-view/custom-view.html`: #}
	{% from "components/custom-input/custom-input.html" import customInput %}
	<form method="post" action="/login">
		{{ customInput('Username', 'user', isRequired=true) }}
		{{ customInput('Password', 'pass', isRequired=true) }}
		{{ customInput('Domain', 'domain') }}
		<button>Login</button>
	</form>

	
## Template slots

Within a template you can define slots using [`block`](http://mozilla.github.io/nunjucks/templating.html#block)s. You can overwrite or extend the content of these blocks in templates using inheritance.

### Define slot using block

	{# in `src/views/_base-view/base-view.html`: #}
	{% block appHeader %}
		{% include "components/app-header/app-header.html" %}
	{% endblock %}
	
### Overwrite content in block
	
	{# in `src/views/custom-view/custom-view.html`: #}
	{% extends "views/_base-view/base-view.html" %}
	{% block appHeader %}
		Content overwriting the original content of appHeader in base-view.
	{% endblock %}
	
### Extend content in block

Extend content in block using the `{{ super() }}` expression:
	
	{# in `src/views/custom-view/custom-view.html`: #}
	{% extends "views/_base-view/base-view.html" %}
	{% block appHeader %}
		Extra content before original content of appHeader in base-view.
		{{ super() }}
		Extra content after original content of appHeader in base-view.
	{% endblock %}	

	
## Main view

To set the project's main view we extend the desired view in the main index template in [`src/index.html`](../src/index.html). By default, the guide-viewer is the main view:

	{# in `src/index.html`: #}
	{% extends "views/_guide-viewer/guide-viewer.html" %}
	
If you've created a custom home view and want to make this the main view simply change this to:

	{% extends "views/home/home.html" %}

	
## Default template

New modules can be generated using `gulp create_module`. Depending on the module type selected in this task, it creates a module based on the `src/components/_template/` or `src/views/_template/`. These directories contain the [component HTML template](../src/components/_template/template.html) and [view HTML template](../src/views/_template/template.html). You can modify these as you want. The `MODULE_NAME` constant is automatically substituted by the name of the new module.

## Component demo template

To demo the use of your component in a 'real life' page, you can create a `<component>-demo.html` file in your component folder:

    my-component.html
    my-component-demo.html

From this point on, the demo HTML file will be used as the default view in the front-end guide viewer. Both this file and the component template + rendered HTML will be available for inspection in the front-end guide viewer.

## Render templates

All templates are rendered by running `gulp build_html`. If you want to author templates and see the changes live in the browser use `gulp watch`.


## IDE integration

The Nunjucks templating syntax is (almost) identical to Jinja2 (Python), Twig (PHP) and similar to Liquid (Ruby). While Nunjucks has limited support in most IDEs, there's [Twig plugin for most IDEs](http://twig.sensiolabs.org/doc/templates.html#ides-integration), which work just as well for Nunjucks templates. If you are using a JetBrains product other than PHPStorm, so for instance WebStorm, use the [JetBrains Twig Plugin](https://plugins.jetbrains.com/plugin/7303?pr=). Download the plugin and install it (Settings > Plugins > install plugin from disk ...). Then register the *.html pattern with the Twig file type (Settings > File Types > Twig) giving you Nunjucks syntax support in all your templates.
