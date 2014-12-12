# Authoring scripts (JS)

The front-end guide uses the [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) pattern for module based JS development.


## Define module

AMD allows us to define each module as a factory which can require other modules as dependencies. Using the AMD signature `define([/*deps*/], function factory(/*deps*/){ /*module behavior*/ });` we can for instance define a component like:

```js

	// src/components/my-component/my-component.js
	define([], function myComponent(){ // function name is only for easy debugging		return {
			greet: function(message){ return 'hello ' + message; }	
		}
	});
```
	
Views and components can require each other:

```js

	// src/views/my-view/my-view.js
	define(['components/my-component'], function(myComponent){
		window.alert( myComponent.greet('my-view') );
	});
```

Modules can also require vendor (third party) components:

```js

	// src/components/search-menu/search-menu.js
	define(['expandible'], function searchMenu(Expandible){
		'use strict';
		var menu = document.querySelector('[data-search-menu]');
		return new Expandible(menu);
	});
```

## AMD configuration

Within the front-end guide the AMD context can be configured in [`src/amd-config.json`](../src/amd-config.json). See the RequireJS (an AMD API) docs for [configuration options](http://requirejs.org/docs/api.html#config).

### Main script

The front-end guide assumes [`src/index.js`](../src/index.js) to be the main script. All modules which should be bundled into the project should be included in this script.

### Paths

Modules are required in a module by using their filepath in a module's array of dependencies. In the front-end guide the `baseUrl` in the AMD config is forced to `src/`, so all paths are relative to `src/`. To prevent having to use the filepaths with the module name in it twice (like components/my-component/my-component) we define aliases as [paths](http://requirejs.org/docs/api.html#config-paths) in the AMD config:

```json

	"paths": {
        "components/my-component": "components/my-component/my-component",
        "views/search-results": "views/search-results"
	}
```
	
This allows us to simply use `components/my-component`. The `gulp create_module` task automatically registers a path for the new module in the config file.

In addition we can define aliases for vendor scripts here so they are easy to reference:

```json

	"paths": {
        "jquery": "vendor/jquery/dist/jquery"
	}
```

This allows us to include jQuery like `define(['jquery'], function($){ $('#foo').hide(); });`.

### Shims

[Shims](http://requirejs.org/docs/api.html#config-shim) are a way to use non-AMD scripts in the project and can also be defined in the AMD config. For example:

```json

	"shims": {
		"foundation.core": {
        	"deps": ["jquery"],
        	"exports": "Foundation"
    	}
	}
```
	
Note: A shim's dependencies `deps` must be written as an array as the front-end guide uses [AlmondJS](https://github.com/jrburke/almond) for an optimized build, wich does not accept a string value.

## Automated testing

The front-end guide includes an opinionated testing environment using [Karma Runner](http://karma-runner.github.io/) and [Jasmine](http://jasmine.github.io/2.0/introduction.html). To run the tests use `gulp test_run` to run once or `gulp test_watch` to run every time a script changes. When the repository is connected to [Travis CI](https://travis-ci.org/), these tests also run during every Travis build as this is configured in [`package.json`](../package.json): `"test": "gulp test_run"`.

### Unit tests

When a new module is generated using `gulp create_module` a test is automatically added to the new module directory, named `my-module.test.js`. The test simply requires the module to test using the AMD pattern and then uses [Jasmine's vocabulary](http://jasmine.github.io/2.0/introduction.html#section-It&rsquo;s_Just_Functions) to describe your module's behavior. For example:

```js

	// src/components/my-component/my-component.test.js:
	define(['components/my-component'],function (myComponent) {
		describe('my-component', function () {
			describe('the `greet` method on my-component',function () {
				it('should greet you with hello', function () {
					expect(myComponent.greet('you')).toBe('hello you');
				});
			});
		});
	});
	
```
	
All files ending with `*.test.js` are automatically included in the testing environment.


## Script template

New modules can be generated using `gulp create_module`. Depending on the module type selected in this task, it creates a module based on the `src/components/_template/` or `src/views/_template/`. These directories contain both the script template and a test template:

* [component script template](../src/components/_template/template.js)
* [component test template](../src/components/_template/template.test.js)
* [view script template](../src/views/_template/template.js)
* [view test template](../src/views/_template/template.test.js)

You can modify these as you want. The `MODULE_NAME` constant is automatically substituted by the name of the new module.


## Include scripts in HTML template

By default the main script is referenced in [`base-view.html`](../src/views/_base-view/base-view.html) just before the closing `</body>`:

	{# in `src/views/_base-view/base-view.html`: #}
    {% block scripts %}
        <script src="{{ paths.assets }}index.js"></script>
    {% endblock %}
    
You can [overwrite or extend](authoring-templates.md#template-slots) this script slot like any other block:

	{# in `src/views/custom-view/custom-view.html`: #}
	{% extends "views/_base-view/base-view.html" %}
	{% block scripts %}
		<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
		{{ super() }}
	{% endblock %}	

You can also inline script directly or from a JavaScript file elsewhere in the front-end guide. This is especially useful for view specific rules and exceptions:

	{% block scripts %}
		<script>
			/* example of inline script added to sripts block: */
			var viewConfig = { debug: true };
		</script>
		{{ super() }}
		<script>			
			/* example of including external JavaScript into scripts block: */
			{% include "views/custom-view/special-rules.js" %}
		</script>
	{% endblock %}	

A good example of these options is the scripts block in [`guide-viewer.html`](src/views/_guide-viewer/guide-viewer.html).


## Coding conventions

The build process automatically validates the JS against coding conventions, using [JSHint](http://www.jshint.com/) as a linter (checks for syntax errors) and [JSCS](https://github.com/jscs-dev/node-jscs) as a code style checker. The JSHint rules are defined in [`src/.jshintrc`](../src/.jshintrc) ([available JSHint rules](http://www.jshint.com/docs/options/)) and the JSCS rules are defined in [`.jscsrc`](../.jscsrc) ([available JSCS rules](https://github.com/jscs-dev/node-jscs#rules)).

Note: When using WebStorm, make sure the JSHint configuration is used by checking enable JSHint and use config files in Settings > JavaScript > Code Quality Tools > JSHint.

### Data-attributes as JS hooks

For a clear separation of concerns De Voorhoede uses only data-attributes as JS hooks. See for example De Voorhoede's [Expandlible](https://github.com/voorhoede/expandible):

```html

	<div class="panel" data-expandible>
		<div class="panel-heading expandible-handle" data-expandible-handle="toggle">
			<h3 class="panel-title">Features A-Z</h3>
		</div>
		<div class="expandible-content" data-expandible-content>
			<div class="panel-body"><!-- content --></div>
		</div>
	</div>
```

Note: As the attributes are defined in the module's HTML and not in the script, this best practice is not a coding convention which can be checked using JSHint or JSCS.


## Script optimizer

The `build_js` task bundles all module scripts into [`dist/assets/index.js`](../dist/assets/index.js) accompanied by its' [sourcemaps](dist/assets/index.js.map). The build script uses RequireJS' optimizer [r.js](https://github.com/jrburke/r.js/#rjs) using [AlmondJS](https://github.com/jrburke/almond) as module loader shim.