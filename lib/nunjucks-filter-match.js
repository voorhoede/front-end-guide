/**
 * Match returns a filtered list, only containing those items that matched against the given pattern.
 *
 * To use this filter in a template, first register it in the Nunjucks environment:
 *   env.addFilter('match', match);
 *
 * @example <caption>Only items starting with lower case</caption>
 *   {% for item in ["alpha", "Beta", "charlie"] | match('^[a-z]') %}{{ item }}, {% endfor %}
 *   // outputs: alpha, charlie,
 *
 * @param {String[]} arr    Array of strings to match.
 * @param {String} pattern  Pattern to match array items against.
 * @returns {*}
 */
function match(arr, pattern) {
	var re = new RegExp(pattern);
	return arr.filter(function(item){
		return re.test(item);
	});
}

module.exports = match;