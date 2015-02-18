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
        if(file.isDirectory()){
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
    var spritePath = '@{pathToAssets}' + dir.relative.replace('/assets-raw/','/');
    var options = {
        // svg-sprite inferred options https://github.com/jkphl/svg-sprite#rendering-configuration
        render              : {
            css             : false,
            scss            : false,
            less            : {
                dest        : 'icons.less',
                template    : 'lib/iconkit/template-less.mustache'
            }
        },
        spritedir: '../assets/icons',
        // iconizr specific options
        quantize            : false,
        level               : 1
    };
    var callback = function(err, results) {
        pngPrefix(modulePath);
        correctSpritePath(modulePath, spritePath);
    };
    iconizr.createIconKit(modulePath + iconsDir, modulePath + stylesDir, options, callback);
}

/**
 * Prefix png variables with `@png-` instead of `@svg-`
 * @param {String} modulePath
 */
function pngPrefix(modulePath) {
    ['icons-png-data.less', 'icons-png-sprite.less']
        .map(function(filename){
            return modulePath + stylesDir + '/' + filename;
        })
        .forEach(function(filename){
            var contents = fs.readFileSync(filename, 'utf8');
            contents = contents.replace(/@svg-/gm, '@png-');
            fs.writeFileSync(filename, contents);
        });
}

function correctSpritePath(modulePath, spritePath) {
    ['icons-png-sprite.less', 'icons-svg-sprite.less']
        .map(function(filename){
            return modulePath + stylesDir + '/' + filename;
        })
        .forEach(function(filename){
            var contents = fs.readFileSync(filename, 'utf8');
            contents = contents.replace(/\.\.\/assets\/icons\/.*(\);)/gm, '\'' + spritePath + '$1\');');
            fs.writeFileSync(filename, contents);
        });
}