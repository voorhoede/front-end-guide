# Authoring styles (LESS/CSS)

The front-end guide uses [LESS](http://lesscss.org/features/) for module based CSS development. 

"Less is a CSS pre-processor, meaning that it extends the CSS language, adding features that allow [variables](http://lesscss.org/features/#variables-feature), [mixins](http://lesscss.org/features/#mixins-feature), functions and many other techniques that allow you to make CSS that is more maintainable, themable and extendable." -- [LESS](http://lesscss.org/)

## Define module styles

Each module should declare it's own presentation in it's own LESS file.

### Module namespace

The aim of module based development is that a module can exist on its own without affecting or being affected by other modules. To prevent styles from leaking into or from other modules we suggest using the module name as a namespace selector:

```css
	
	.my-module {
		// add style rules for component within `my-module` namespace.
		.nested-item { }
	}
```

Or alternatively as a selector prefix (faster and more flexible):

```css

	.my-module-header { }
	.my-module-body   { }
	// etc
```

### Module dependencies

Modules may depend on the styling of other modules. LESS supports dependency management using the [`@import`](http://lesscss.org/features/#import-options) directive. This allows us to require other files to be part of the output CSS using `@import (once) "path/to/file"` or only as a reference (useful for variables and mixins) using `@import (reference) "path/to/file"`. The [app-header component](../src/components/app-header/app-header.less) is an example of how we could put this concept to use:

```css

	@import (reference) "../app-core-styles/styles/mixins/clearfix";
	@import (reference) "../app-core-styles/styles/variables";
	@import (once) "../app-core-styles/app-core-styles";
	@import (once) "../app-logo/app-logo";
	@import (once) "../search-menu/search-menu";
	
	.app-header {
		.clearfix();
		position: relative;
		border-bottom: 1px solid @brand-highlight;
		.app-logo    { float: left; }
		.main-menu   { float: left; }
		.user-menu   { float: right; }
		.search-menu { float: right; }
	}
```


## Main index

The front-end guide assumes [`src/index.less`](../src/index.less) to be the main style index. All modules which should be bundled into the project should be included in this file.


## Default LESS template

New modules can be generated using `gulp create_module`. Depending on the module type selected in this task, it creates a module based on the `src/components/_template/` or `src/views/_template/`. These directories contain the [component LESS template](../src/components/_template/template.less) and [view LESS template](../src/views/_template/template.less). You can modify these as you want. The `MODULE_NAME` constant is automatically substituted by the name of the new module.


## Include styles in HTML template

By default the main stylesheet is referenced in the [`base-view.html`](../src/views/_base-view/base-view.html) `<head>`:

	{# in `src/views/_base-view/base-view.html`: #}
    {% block styles %}
        <link rel="stylesheet" href="{{ paths.assets }}index.css">
    {% endblock %}
    
You can [overwrite or extend](authoring-templates.md#template-slots) this style slot like any other block:

	{# in `src/views/custom-view/custom-view.html`: #}
	{% extends "views/_base-view/base-view.html" %}
	{% block styles %}
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
		{{ super() }}
	{% endblock %}	

You can also inline style rules directly or from a CSS file elsewhere in the front-end guide. This is especially useful for view specific rules and exceptions:

	{% block styles %}
		{{ super() }}
		<style type="text/css">
			/* example of inline styles added to styles block: */
			html { background-color: hotpink; }
			/* example of including external CSS rules into styles block: */
			{% include "views/custom-view/special-rules.css" %}
		</style>
	{% endblock %}	
	

## Coding conventions

The build process automatically validates the generated CSS against coding conventions, using Twitter's [RECESS](http://twitter.github.io/recess/) as a linter. Conventions, like whether or not IDs are allowed as CSS hooks, can be toggled on/off in [`.recessrc`](../.recessrc). The [available rules](http://twitter.github.io/recess/#what-it-does) are:

* **noIDs** - Don’t style IDs like `#foo`.
* **noJSPrefix** - Don’t style `.js-` prefixed classnames.
* **noOverqualifying** - Don’t overqualify your selectors, like `div#foo.bar`.
* **noUnderscores** - Don’t use underscores when naming classes, like `.my_class`.
* **noUniversalSelectors** - Don’t use the universal selector, `*`.
* **strictPropertyOrder** - Enforce a strict [property order](https://github.com/twitter/recess/blob/master/lib/lint/strict-property-order.js#L36).
* **zeroUnits** - Don’t add the unit to a value of 0, like `0px`.

### Only tag names & class names as CSS selectors

For a clear separation of concerns De Voorhoede uses only tag names & class names as CSS selectors (hooks). Never use IDs as CSS hooks.

### Limit nesting

LESS allows us to [nest rules](http://lesscss.org/features/#features-overview-feature-nested-rules). This is useful for namespacing, pseudo classes and module/selector specific media queries. However try to limit nesting to two levels deep as it makes rules over-specific which makes the project harder to maintain. Nesting many levels means style rules start to mimic the content structure which is clearly not a separation of concerns.

### Vendor prefixing

The front-end guide uses [Autoprefixer](https://github.com/postcss/autoprefixer-core) to add the correct vendor prefixes for the project's browser scope. So there is no need to use LESS mixins for vendor prefixes for cross browser compatible CSS rules. You can set the `autoprefixBrowsers` ([options](https://github.com/postcss/autoprefixer#browsers)) in [`config.js`](../config.js).


## Style processor

The `build_less` task bundles all module styles into [`dist/assets/index.css`](../dist/assets/index.css) accompanied by its' [sourcemaps](dist/assets/index.css.map). The build script uses [LESS.js](https://github.com/less/less.js) to compile the LESS files, [RECESS](http://twitter.github.io/recess/) as a linter and [Autoprefixer](https://github.com/postcss/autoprefixer-core) to add needed browser prefixes. 