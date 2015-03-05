/**
 * @module airhooks/toggleClass OR
 * @method airhooks.toggleClass
 *
 * Remove a class from an element's list of classes.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Element.classList)
 * [Original source](http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/)
 *
 * @param {HtmlElement} element
 * @param {String} className
 * @param {Boolean} [force] - Force the class name to be added or removed based on value's truthiness.
 */
(function (root, airhooks, factory) {
	var method = 'toggleClass';
	if (typeof define === 'function' && define.amd) {
		define(['airhooks/addClass','airhooks/containsClass', 'airhooks/removeClass'], factory);
	} else {
		airhooks[method] = factory(airhooks.addClass, airhooks.containsClass, airhooks.removeClass);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (addClass, containsClass, removeClass) {
	return function (element, className, force) {
		var isForced = (typeof force !== 'undefined');
		if (document.documentElement.classList) {
			if(isForced){
				return element.classList.toggle(className, force);
			} else {
				return element.classList.toggle(className);
			}
		} else {
			if (containsClass(element, className) || (isForced && !force)){
				removeClass(element, className);
				return false;
			} else {
				addClass(element, className);
				return true;
			}
		}
	};
}));

