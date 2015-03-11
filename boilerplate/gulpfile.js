var gulp = require('gulp');
var guide = require('front-end-guide')(gulp);

gulp.task('build_less', guide.buildLessTask());
gulp.task('build_html', guide.buildHtmlTask());
gulp.task('build_js',['jshint_src'], guide.buildJsTask());
gulp.task('build_less', guide.buildLessTask());
gulp.task('build_module_info', guide.buildModuleInfoTask());
gulp.task('build_previews', guide.buildPreviewsTask());
gulp.task('copy_assets', guide.copyAssetsTask());
gulp.task('create_module', guide.createModule());
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
gulp.task('clean_dist', guide.cleanDistTask());
gulp.task('build_assets', guide.runSequence('imagemin', 'copy_assets'));
gulp.task('build_clean', guide.runSequence('clean_dist', 'build'));
gulp.task('build_guide', guide.runSequence('build_clean', 'build_previews', 'build_module_info'));
gulp.task('watch', guide.runSequence(['build_guide', 'serve'], guide.watchTask()));