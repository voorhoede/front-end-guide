/**
 * @module airhooks/removeClass OR
 * @method airhooks.removeClass
 *
 * Remove a class from an element's list of classes.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Element.classList)
 * [Original source](http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/)
 *
 * @param {HtmlElement} element
 * @param {String} className
 */
(function (root, airhooks, factory) {
	var method = 'removeClass';
	if (typeof define === 'function' && define.amd) {
		define([/*deps*/], factory);
	} else {
		airhooks[method] = factory(/*deps*/);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (/*deps*/) {
	return function (element, className) {
		if (document.documentElement.classList) {
			element.classList.remove(className);
		} else {
			var regexp = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
			element.className = element.className.replace(regexp, '$2');
		}
	};
}));

