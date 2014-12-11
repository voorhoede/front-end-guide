var iconizr = require('iconizr');
var options = {
        // svg-sprite inferred options https://github.com/jkphl/svg-sprite#rendering-configuration
        render              : {
            css             : {
                template    : 'src/assets_/iconkit2/sprite.template.css'
            },
            scss            : false,
            less: true
            //less            : {
                //template    : 'src/assets/_iconkit2/template.less',
            //}
        },
        // ...

        // iconizr specific options
        quantize            : true,
        level               : 5
        /* Further configuration options, see below ... */
    };
var callback = function(err, results) { /*
     If no error occurs, `results` will be a JSON object like this one:

     {
     success          : true,     // Overall success
     length           : 3,        // Total number of files written
     files            : {         // Files along with their file size in bytes
     '/path/to/your/cwd/css/output/directory/svg/sprite.svg'   : 436823,
     '/path/to/your/cwd/css/output/directory/sprite.css'       : 1821,
     '/path/to/your/cwd/sass/output/directory/_sprite.scss'    : 2197
     },
     options          : {         // refined configuration options, see above
     // ...
     },
     data             : {         // Mustache template variables, see below
     // ...
     }
     }
    */
};

iconizr.createIconKit('src/assets/_icons', 'src/assets/_iconkit2', options, callback);