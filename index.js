module.exports = function (gulp) {

    /* Dependencies (A-Z) */
    var _ = require('lodash-node');
    var autoprefixer = require('gulp-autoprefixer');
    var browserSync = require('browser-sync');
    var cached = require('gulp-cached');
    var del = require('del');
    var gulpif = require('gulp-if');
    var filter = require('gulp-filter');
    var imagemin = require('gulp-imagemin');
    var jscs = require('gulp-jscs');
    var jshint = require('gulp-jshint');
    var fs = require('fs');
    var karma = require('gulp-karma');
    var less = require('gulp-less');
    var markdownIt = require('markdown-it');
    var moduleUtility = require('./lib/module-utility');
    var newer = require('gulp-newer');
    var nunjucksRender = require('./lib/nunjucks-render');
    var path = require('path');
    var plumber = require('gulp-plumber');
    var pngquant = require('imagemin-pngquant');
    var prism = require('./lib/prism');
    var recess = require('gulp-recess');
    var rename = require('gulp-rename');
    var replace = require('gulp-replace');
    var rjs = require('requirejs');
    var runGulpSequence = require('run-sequence').use(gulp);
    var sourcemaps = require('gulp-sourcemaps');
    var zip = require('gulp-zip');

    /* Shared configuration (A-Z) */
    var config = require('./lib/config.js');
    var filesToCopy = config.filesToCopy;
    var paths = config.paths;
    var pkg = require('./package.json');


    function configure(options) {
        config = _.extend(config, options);
    }

    function taskSettings(options) {
        return _.extend({}, config, options || {});
    }

    function configureNunjucks() {
        var env = nunjucksRender.nunjucks.configure(paths.src, {watch: false});
        env.addFilter('match', require('./lib/nunjucks-filter-match'));
        env.addFilter('prettyJson', require('./lib/nunjucks-filter-pretty-json'));
    }

    function getFileContents(path) {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
        } else {
            return '';
        }
    }

    function highlightCode(code, lang) {
        if (!code.length) {
            return code;
        }
        code = prism.highlight(code, prism.languages[lang]);
        code = '<pre class="language-' + lang + '"><code>' + code + '</code></pre>';
        return code;
    }

    function htmlModuleData(file) {
        var pathToRoot = path.relative(file.relative, '.');
        pathToRoot = pathToRoot.substring(0, pathToRoot.length - 2);
        return {
            module: {
                id: path.dirname(file.relative),
                name: parsePath(file.relative).basename,
                html: file.contents.toString()
            },
            paths: {
                assets: pathToRoot + 'assets/',
                root: pathToRoot
            },
            pkg: pkg
        };
    }

    function listDirectories(cwd) {
        return fs.readdirSync(cwd)
            .filter(function (file) {
                return fs.statSync(cwd + file).isDirectory();
            });
    }

    function parsePath(filepath) {
        var extname = path.extname(filepath);
        return {
            dirname: path.dirname(filepath),
            basename: path.basename(filepath, extname),
            extname: extname
        };
    }


    function srcFiles(filetype) {
        return gulp.src(paths.srcFiles, {base: paths.src})
            .pipe(filter('**/*.' + filetype));
    }

    function reloadBrowser(options) {
        // only reload browserSync if active, otherwise causes an error.
        return gulpif(browserSync.active, browserSync.reload(options));
    }

    function createModule() {
        return function () {
            return moduleUtility.create();
        };
    }

    function editModule() {
        return function () {
            return moduleUtility.edit();
        };
    }


    function runSequence() {
        var args = Array.prototype.slice.call(arguments);
        return function (cb) {
            if ('function' !== typeof args[args.length - 1]) {
                args[args.length] = cb;
            }
            runGulpSequence.apply(this, args);
        };
    }

    function buildHtml() {
        return function () {
            configureNunjucks();
            var moduleIndex = moduleUtility.getModuleIndex();
            return srcFiles('html')
                .pipe(plumber()) // prevent pipe break on nunjucks render error
                .pipe(nunjucksRender(function (file) {
                    return _.extend(
                        htmlModuleData(file),
                        {moduleIndex: moduleIndex}
                    );
                }))
                .pipe(plumber.stop())
                .pipe(gulp.dest(paths.dist))
                .pipe(reloadBrowser({stream: true}));
        };
    }


    function buildModuleInfo() {
        return function () {
            var markdown = new markdownIt({
                highlight: function(str, lang) {
                    return prism.highlight(str, prism.languages[lang || 'markup']);
                }
            });
            ['Components', 'Views'].forEach(function (moduleType) {
                listDirectories(paths['src' + moduleType])
                    .filter(function (name) {
                        return (name.substr(0, 1) !== '_');
                    })
                    .map(function (name) {
                        var srcBasename = paths['src' + moduleType] + name + '/' + name;
                        var distBasename = paths['dist' + moduleType] + name + '/' + name;
                        var moduleInfo = {
                            name: name,
                            readme: markdown.render(getFileContents(paths['src' + moduleType] + name + '/README.md')),
                            html: highlightCode(getFileContents(distBasename + '.html'), 'markup'),
                            'demo html': highlightCode(getFileContents(distBasename + '-demo.html'), 'markup'),
                            css: highlightCode(getFileContents(distBasename + '.css'), 'css'),
                            template: highlightCode(getFileContents(srcBasename + '.html'), 'twig'),
                            less: highlightCode(getFileContents(srcBasename + '.less'), 'css'),
                            js: highlightCode(getFileContents(srcBasename + '.js'), 'javascript')
                        };
                        fs.writeFileSync(distBasename + '-info.json', JSON.stringify(moduleInfo, null, 4));
                    });
            });
        };
    }

    function buildPreviews() {
        return function () {
            configureNunjucks();
            var templateHtml = fs.readFileSync(paths.srcViews + '_component-preview/component-preview.html', 'utf8');
            return gulp.src(paths.srcComponents + '*/*.html', {base: paths.src})
                .pipe(plumber()) // prevent pipe break on nunjucks render error
                .pipe(nunjucksRender(htmlModuleData))
                .pipe(nunjucksRender(htmlModuleData, templateHtml))
                .pipe(plumber.stop())
                .pipe(rename(function (p) {
                    p.basename += '-preview';
                }))
                .pipe(gulp.dest(paths.dist));
        };
    }

    function buildJs(options) {
        return function (cb) {
            var settings = taskSettings(options);
            var amdConfig = _.extend(
                require('../../src/amd-config.json'),
                {
                    baseUrl: paths.src,
                    generateSourceMaps: settings.sourceMaps || true, // http://requirejs.org/docs/optimization.html#sourcemaps
                    include: ['index'],
                    name: 'vendor/almond/almond',
                    optimize: settings.uglify || 'uglify2',
                    out: settings.paths.distAssets + 'index.js',
                    preserveLicenseComments: false
                }
            );
            rjs.optimize(amdConfig);
            if (browserSync.active) {
                browserSync.reload();
            }
            cb();
        };
    }

    function buildLess(options) {
        return function () {
            var settings = taskSettings(options);
            return srcFiles('less')
                .pipe(plumber()) // prevent pipe break on less parsing
                .pipe(sourcemaps.init())
                .pipe(less({
                    globalVars: {
                        pathToAssets: '"assets/"'
                    }
                }))
                .pipe(recess())
                .pipe(recess.reporter())
                .pipe(autoprefixer({browsers: settings.autoprefixBrowsers}))
                .pipe(sourcemaps.write('.', {includeContent: true, sourceRoot: ''}))
                .pipe(plumber.stop())
                .pipe(rename(function (p) {
                    if (p.dirname === '.') {
                        p.dirname = 'assets';
                    } // output root src files to assets dir
                }))
                .pipe(gulp.dest(paths.dist)) // write the css and source maps
                .pipe(filter('**/*.css')) // filtering stream to only css files
                .pipe(reloadBrowser({stream: true}));
        };
    }

    function copyFiles() {
        return function () {
            filesToCopy.map(function (file) {
                return gulp.src(file.filepath)
                    .pipe(gulp.dest(file.toDir));
            });
        };
    }

    /**
     * Copy all files from `assets/` directories in source root & modules. Only copies file when newer.
     * The `assets/` string is removed from the original path as the destination is an `assets/` dir itself.
     */
    function copyAssets() {
        return function () {
            paths.assetFiles.map(function (path) {
                return gulp.src(path, {base: paths.src})
                    .pipe(filter(['**/*', '!**/*.less']))
                    .pipe(newer(paths.distAssets))
                    .pipe(rename(function (p) {
                        p.dirname = p.dirname
                            .split('/')
                            .filter(function (dir) {
                                return (dir !== 'assets');
                            })
                            .join('/');
                    }))
                    .pipe(gulp.dest(paths.distAssets));
            });
        };
    }

    function cleanDist() {
        return function (cb) {
            del([paths.dist], cb);
        };
    }

    /**
     * All images placed in a `assets-raw/images/` folder will be optimised (if newer) and placed in `assets/images/`.
     * Examples:
     *  src/assets-raw/images/img.png                           >> src/assets/images/img.png
     *  src/components/my-component/assets-raw/images/img.png   >> src/components/my-component/assets/images/img.png
     *  src/views/my-view/assets-raw/images/img.png             >> src/views/my-view/assets/images/img.png
     * If you don't want an image to be processed place it directly into `assets` instead of `assets-raw`.
     */

    function runImagemin(options) {
        return function () {
            var settings = taskSettings(options);
            var relRawImageDirPath = settings.rawImagesPath || 'assets-raw/images';
            var relRawImageFilePath = relRawImageDirPath + '/**/*.{gif,jpg,jpeg,png,svg}';

            function renameImageDir(path) {
                return path.replace(relRawImageDirPath, 'assets/images');
            }

            return gulp.src([
                settings.paths.src + relRawImageFilePath,
                settings.paths.srcComponents + '*/' + relRawImageFilePath,
                settings.paths.srcViews + '*/' + relRawImageFilePath
            ], {base: settings.paths.src})
                // only process image if the raw image is newer (need to check against renamed output file)
                .pipe(newer({
                    dest: settings.paths.src,
                    map: function (relativePath) {
                        return renameImageDir(relativePath);
                    }
                }))
                .pipe(imagemin({
                    progressive: true,
                    svgoPlugins: [],
                    use: [pngquant()]
                }))
                // output the processed image in the assets output dir
                .pipe(rename(function (path) {
                    path.dirname = renameImageDir(path.dirname);
                }))
                .pipe(gulp.dest(settings.paths.src));
        };
    }

    function jshintNode() {
        return function () {
            return gulp.src(['*.js'])
                .pipe(jshint('.jshintrc'))
                .pipe(jshint.reporter(require('jshint-stylish')));
        };
    }

    function jshintSrc() {
        return function () {
            return srcFiles('js')
                .pipe(cached('hinting')) // filter down to changed files only
                .pipe(jscs())
                .pipe(jshint(paths.src + '.jshintrc'))
                .pipe(jshint.reporter(require('jshint-stylish')));
        };
    }

    function test() {
        return function (action) {
            return function () {
                return gulp.src([
                    // files you put in this array override the files array in karma.conf.js
                ])
                    .pipe(karma({
                        configFile: paths.karmaConfig,
                        action: action
                    }))
                    .on('error', function (err) {
                        throw err;
                    });
            };
        };
    }

    function serve() {
        return function () {
            browserSync(config.browserSync);
        };
    }

    function watch() {
        return function () {
            gulp.watch(paths.assetFiles, ['copy_assets']);
            gulp.watch(paths.htmlFiles, ['build_html', 'build_previews']);
            gulp.watch(paths.jsFiles, ['build_js']);
            gulp.watch(paths.lessFiles, ['build_less']);
        };
    }

    function zipDist() {
        return function () {
            return gulp.src(paths.dist + '**/*')
                .pipe(zip(pkg.name + '.zip'))
                .pipe(gulp.dest(paths.dist));
        };
    }

    return {
        tasks: {
            buildHtml: buildHtml,
            buildModuleInfo: buildModuleInfo,
            buildPreviews: buildPreviews,
            buildJs: buildJs,
            buildLess: buildLess,
            copyAssets: copyAssets,
            copyFiles: copyFiles,
            createModule: createModule,
            cleanDist: cleanDist,
            editModule: editModule,
            runImagemin: runImagemin,
            jshintNode: jshintNode,
            jshintSrc: jshintSrc,
            test: test,
            serve: serve,
            runSequence: runSequence,
            watch: watch,
            zipDist: zipDist
        },
        configure: configure
    };
};
