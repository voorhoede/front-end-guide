var iconizr = require('iconizr');
var fs = require('fs');

var iconkit = {

    /**
     *
     * @param {String} modulePath
     */
    create: function(modulePath) {
        var options = {
            // svg-sprite inferred options https://github.com/jkphl/svg-sprite#rendering-configuration
            render              : {
                css             : false,
                scss            : false,
                less            : {
                    template    : 'lib/iconkit/template-less.mustache',
                    dest        : 'icons.less'
                }
            },
            // iconizr specific options
            quantize            : false,
            level               : 1
        };
        var callback = function(err, results) {
            iconkit.pngPrefix(modulePath);
        };
        iconizr.createIconKit(modulePath + 'icons', modulePath + 'styles', options, callback);
    },

    /**
     * Prefix png variables with `@png-` instead of `@svg-`
     * @param {String} modulePath
     */
    pngPrefix: function(modulePath) {
        var filename = modulePath + 'styles/icons-png-data.less';
        var contents = fs.readFileSync(filename, 'utf8');
        contents = contents.replace(/@svg-/gm, '@png-');
        fs.writeFileSync(filename, contents);
    }
};

iconkit.create('src/components/app-icons/');
//iconkit.pngPrefix('src/components/app-icons/');

module.exports = iconkit;