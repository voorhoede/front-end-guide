/**
 * @module airhooks/forEach OR
 * @method airhooks.forEach
 *
 * forEach executes a provided function once per array element.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
 * [Reference helper](http://underscorejs.org/docs/underscore.html#section-15)
 *
 * @param {Array} array
 * @param {Function} iterator - Function to execute for each element.
 * @param {Object} [context] - Value to use as this when executing callback.
 */
(function (root, airhooks, factory) {
	var method = 'forEach';
	if (typeof define === 'function' && define.amd) {
		define([/*deps*/], factory);
	} else {
		airhooks[method] = factory(/*deps*/);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (/*deps*/) {
	return function(array, iterator, context) {
		var nativeForEach = Array.prototype.forEach;
		if (nativeForEach && array.foreach === nativeForEach) {
			array.forEach(iterator, context);
		} else {
			for (var i = 0, length = array.length; i < length; i++) {
				iterator.call(context, array[i], i, array);
			}
		}
	};
}));
