var iconizr = require('iconizr');
var fs = require('fs');
var path = require('path');
var through = require('through2');

module.exports = {
    create: create,
    processStream: processStream
};

var iconsDir = 'assets-raw/icons';
var stylesDir = 'styles';

/**
 *
 * @returns {DestroyableTransform}  Stream object
 */
function processStream() {
    return through.obj(function (file, enc, cb) {
        if (file.isDirectory()) {
            create(file);
        }

        this.push(file);
        cb();
    });
}

/**
 *
 * @param {Object} dir
 */
function create(dir) {
    var modulePath = dir.path.split(iconsDir)[0];
    var spritePath = '@{pathToAssets}' + dir.relative.replace('/assets-raw/', '/');
    var options = {
        // svg-sprite inferred options https://github.com/jkphl/svg-sprite#rendering-configuration
        render: {
            css: false,
            scss: false,
            less: {
                dest: 'icons.less',
                template: 'lib/iconkit/template-less.mustache'
            }
        },
        prefix: 'icon',
        spritedir: '',
        // iconizr specific options
        quantize: false,
        level: 1
    };

    iconizr.createIconKit(modulePath + iconsDir, modulePath + 'assets/icons', options, function () {
    });
}
