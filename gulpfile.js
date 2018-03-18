var gulp = require('gulp');
var sass = require('gulp-sass');
var compass = require('gulp-compass');

// 关于学习gulp、sass、compass参考链接如下
// gulp: 
// 	1、http://www.gulpjs.com.cn/docs/api/(中文网)
// 	2、http://www.cnblogs.com/morong/p/4469637.html(使用案例总结)
// sass: https://www.sass.hk/guide/
// compass: 
// 	1、http://compass-style.org/install/(官网)
// 	2、http://www.ruanyifeng.com/blog/2012/11/compass.html
// 	3、http://www.sassplus.com/sass/152.html(配置文件介绍)

gulp.task('sass', function() {
	return gulp.src('./public/sass/**/*.scss')
		.pipe(sass({outputStyle:'expanded'}).on('error', sass.logError))
		.pipe(gulp.dest('./public/mycss'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./public/sass/**/*.scss', ['sass']);
});

gulp.task('compass', function() {
  gulp.src('./public/sass/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: './public/mycss',
      sass: './public/sass'
    }))
    .pipe(gulp.dest('./public/mycss'));
});

gulp.task('compass:watch', function () {
  gulp.watch('./public/sass/**/*.scss', ['compass']);
})
