# Authoring styles (LESS/CSS)

## Coding conventions

The build process automatically validates the generated CSS against coding conventions, using Twitter's [RECESS](http://twitter.github.io/recess/) as a linter. Conventions, like whether or not IDs are allowed as CSS hooks, can be toggled on/off in [`.recessrc`](../.recessrc). The [available rules](http://twitter.github.io/recess/#what-it-does) are:

* **noIDs** - Don’t style IDs like `#foo`.
* **noJSPrefix** - Don’t style `.js-` prefixed classnames.
* **noOverqualifying** - Don’t overqualify your selectors, like `div#foo.bar`.
* **noUnderscores** - Don’t use underscores when naming classes, like `.my_class`.
* **noUniversalSelectors** - Don’t use the universal selector, `*`.
* **strictPropertyOrder** - Enforce a strict [property order](https://github.com/twitter/recess/blob/master/lib/lint/strict-property-order.js#L36).
* **zeroUnits** - Don’t add the unit to a value of 0, like `0px`.

### Class names as CSS hooks