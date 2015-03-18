/**
 * @module airhooks/removeEventListener OR
 * @method airhooks.removeEventListener
 *
 * Removes the event listener previously registered with addEventListener.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener)
 *
 * @param {Element|Object} target - The event target like an Element, Document,
 *   Window, or any other object that supports events (such as XMLHttpRequest).
 * @param {String} type - The event type the listener is .
 * @param {Function} listener - Event listener called when event is triggered.
 */
(function (root, airhooks, factory) {
	var method = 'removeEventListener';
	if (typeof define === 'function' && define.amd) {
		define([/*deps*/], factory);
	} else {
		airhooks[method] = factory(/*deps*/);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (/*deps*/) {
	if (document.removeEventListener) {
		return function (target, type, listener) {
			target.removeEventListener(type, listener, false);
		};
	} else {
		return function (target, type, listener) {
			target.detachEvent('on' + type, listener);
		};
	}
}));