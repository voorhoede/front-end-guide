var guide = require('front-end-guide');
var gulp = require('gulp');

gulp.task('build_less', guide.buildLessTask());
gulp.task('build_html', guide.buildHtmlTask());
gulp.task('build_js',['jshint_src'], guide.buildJsTask());
gulp.task('build_less', guide.buildLessTask());
gulp.task('build_module_info', guide.buildModuleInfoTask());
gulp.task('build_previews', guide.buildPreviewsTask());
gulp.task('copy_assets', guide.copyAssetsTask());
gulp.task('create_module', guide.createModule());
gulp.task('edit_module', guide.editModule());
gulp.task('jshint', ['jshint_src', 'jshint_node']);
gulp.task('jshint_node', guide.jshintNodeTask());
gulp.task('jshint_src', guide.jshintSrcTask());
gulp.task('imagemin', guide.imageminTask());
gulp.task('process_images', guide.imageminTask());
gulp.task('serve', guide.serveTask());
gulp.task('test_run', guide.testTask('run'));
gulp.task('test_watch', guide.testTask('watch'));
gulp.task('zip_dist', guide.zipDistTask());

gulp.task('default', ['build_guide']);
gulp.task('build', ['build_html', 'build_js', 'build_less', 'copy_assets']);
gulp.task('clean_dist', function (cb) { del([paths.dist], cb); });
gulp.task('build_assets', function(cb) { runSequence('imagemin', 'copy_assets', cb);});
gulp.task('build_clean',  function(cb) { runSequence('clean_dist', 'build', cb); });
gulp.task('build_guide',  function(cb) { runSequence('build_clean', 'build_previews', 'build_module_info', cb); });
gulp.task('watch', function() { runSequence(['build_guide', 'serve'], guide.watchTask()); });
