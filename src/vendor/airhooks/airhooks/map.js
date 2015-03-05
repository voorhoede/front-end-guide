/**
 * @module airhooks/map OR
 * @method airhooks.map
 *
 * forEach executes a provided function once per array element.
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
 * [Reference helper](http://underscorejs.org/docs/underscore.html#section-16)
 *
 * @param {Array} array
 * @param {Function} iterator - Function to execute for each element.
 * @param {Object} [context] - Value to use as this when executing callback.
 */
(function (root, airhooks, factory) {
	var method = 'map';
	if (typeof define === 'function' && define.amd) {
		define(['./forEach'], factory);
	} else {
		airhooks[method] = factory(airhooks.forEach);
		root.airhooks = airhooks;
	}
}(this, this.airhooks || {}, function (forEach) {
	return function(array, iterator, context) {
		var nativeMap = Array.prototype.map;
		if (nativeMap && array.map === nativeMap){
			return array.map(iterator, context);
		} else {
			var results = [];
			forEach(array, function(value, index, list) {
				results.push(iterator.call(context, value, index, list));
			});
			return results;
		}
	};
}));
