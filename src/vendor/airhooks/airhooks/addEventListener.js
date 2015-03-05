/**
 * @module airhooks/addEventListener OR
 * @method airhooks.addEventListener
 *
 * Bind listener to event on target using whichever browser method is supported.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener)
 *
 * @example AMD
 *   require(['airhooks/addEventListener'], function(addEventListener) {
 *     var target = document.querySelector('[data-target]');
 *     addEventListener(target, 'click', function(event){ alert('!'); });
 *   });
 *
 * @example WEB
 *   (function(airhooks){
 *     var target = document.querySelector('[data-target]');
 *     airhooks.addEventListener(target, 'click', function(event){ alert('!'); });
 *   }(this.airhooks);
 *
 * @param {Element|Object} target - The event target like an Element, Document,
 *   Window, or any other object that supports events (such as XMLHttpRequest).
 * @param {String} type - The event type to listen for.
 * @param {Function} listener - Event listener called when event is triggered.
 */
(function (root, airhooks, factory) {
	var method = 'addEventListener';
	if (typeof define === 'function' && define.amd) {
		define([/*deps*/], factory);
	} else {
		airhooks[method] = factory(/*deps*/);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (/*deps*/) {
	if (document.addEventListener) {
		return function (target, type, listener) {
			target.addEventListener(type, listener);
		};
	} else {
		return function (target, type, listener) {
			target.attachEvent('on' + type, function(){
				listener.call(target);
			});
		};
	}
}));