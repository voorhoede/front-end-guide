// Forked version of gulp-nunjucks render (https://github.com/carlosl/gulp-nunjucks-render).
// This module expects a function which is called for each file to be rendered, rather than a static options object.
// This module also allows you to render the content inside another template as the content is available in the first
// function using file.contents.toString() which you can put in the options for the shared template however you like.
'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var nunjucks = require('nunjucks');

/**
 * @param {Function} [fn]   Function called for each file. Should return an options object, which is used as context
 *                          in renderString (http://mozilla.github.io/nunjucks/api.html#renderstring1).
 * @param {String} [sharedTemplateHtml] Used as string inside renderString instead of the contents of the current file.
 *                                      This allows you to use the file contents inside another (shared) template.
 * @returns {DestroyableTransform}  Stream object
 */
module.exports = function (fn, sharedTemplateHtml) {
	var defaults = {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('nunjucks-render', 'Streaming not supported'));
			return cb();
		}

		try {
			var options = fn ? fn(file): defaults;
			var templateHtml = sharedTemplateHtml || file.contents.toString();
			file.contents = new Buffer(nunjucks.renderString(templateHtml, options));
			file.path = gutil.replaceExtension(file.path, '.html');

		} catch (err) {
			this.emit('error', new gutil.PluginError('nunjucks-render', err));
		}

		this.push(file);
		cb();
	});
};

module.exports.nunjucks = nunjucks;
