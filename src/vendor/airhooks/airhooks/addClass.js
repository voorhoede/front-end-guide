/**
 * @module airhooks/addClass OR
 * @method airhooks.addClass
 *
 * Adds a class to an element's list of classes.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Element.classList)
 * [Original source](http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/)
 *
 * @param {HtmlElement} element
 * @param {String} className
 */
(function (root, airhooks, factory) {
	var method = 'addClass';
	if (typeof define === 'function' && define.amd) {
		define([/*deps*/], factory);
	} else {
		airhooks[method] = factory(/*deps*/);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (/*deps*/) {
	return function (element, className) {
		if (document.documentElement.classList) {
			element.classList.add(className);
		} else {
			var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
			if (!element.className.match(re)) {
				element.className += (element.className ? ' ' : '') + className;
			}
		}
	};
}));

