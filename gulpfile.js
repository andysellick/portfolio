var basePaths = {
    src: 'src/',
    dest: 'dist/',
    stat: 'static/'
};
var paths = {
    templates: {
        src: basePaths.src,
        dest: basePaths.dest,
    },
    images: {
        src: basePaths.src + basePaths.stat + 'img/',
        dest: basePaths.dest + basePaths.stat + 'img/',
    },
    scripts: {
        src: basePaths.src + basePaths.stat + 'js/',
        dest: basePaths.dest + basePaths.stat + 'js/'
    },
    styles: {
        src: basePaths.src + basePaths.stat + 'less/',
        dest: basePaths.dest + basePaths.stat + 'css/',
    },
    assets: {
        src: basePaths.src + basePaths.stat + 'assets/',
        dest: basePaths.dest + basePaths.stat + 'assets/',
    },
    bower: {
        src: basePaths.src + basePaths.stat + 'bower_components',
        dest: basePaths.dest + basePaths.stat + 'bower_components',
    }
};

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: '*',
        camelize: true
    }),
    //browserSync = $.browserSync.create(),
    copyFiles = {
        scripts: []
    };
var cssnano = require('gulp-cssnano');
var browserSync = require('browser-sync');

var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var eslint = require('gulp-eslint');
var watchify = require('watchify');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var browserify = require('browserify');

/* CSS - LESS */
function processCss(inputStream, taskType) {
    return inputStream
        .pipe($.plumber(function(error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end');
        }))
        .pipe($.newer(paths.styles.dest))
        .pipe($.less({ paths: [$.path.join(__dirname, 'less', 'includes')] }))
        .pipe($.rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream())
        //.pipe($.notify({ message: taskType + ' task complete' }));
}

gulp.task('styles', ['less:main']);
gulp.task('less:main', function() {
    return processCss(gulp.src(paths.styles.src + 'styles.less'), 'Styles');
});
/*
//copy, compile and minify JS to dist
gulp.task('scripts', ['eslint'], function(){
	process.env.NODE_ENV = 'production';
	$.browserify(paths.scripts.src  + 'main.js')
		.transform('babelify',{presets: ['es2015','react'] })
		.bundle()
		.on('error',function(e){
			const error = gutil.colors.red;
			gutil.log(error('Error in script:',e.message));
		})
		.pipe(source('main.js'))
		.pipe(buffer()) //convert streaming vinyl file object given by source() to buffered vinyl file object
		.pipe(uglify()) //minify JS
		.pipe($.rename({suffix: '.min'})) //rename output to include .min
		.pipe(gulp.dest(paths.scripts.dest)) //pipe to destination
		.pipe(browserSync.stream())
});
*/

//using watchify, seems to be quicker than the former, above, but still slow with uglify
var bundler = watchify(browserify({
	entries : [paths.scripts.src  + 'main.js'],
	cache: {}, 
	packageCache: {}, 
	fullPaths: false,
	debug: false //disable sourcemaps
})).transform("babelify", {presets: ["es2015", "react"]});
bundler.on('update', bundle);

function bundle(){
	process.env.NODE_ENV = 'production';
	var minify = 1;
	if(argv.devmode){
		minify = 0;
	}
	return bundler.bundle()
		.on('error',function(e){
			const error = gutil.colors.red;
			gutil.log(error('Error in script:',e.message));
		})
		.pipe(source('main.js'))
		.pipe(buffer()) //convert streaming vinyl file object given by source() to buffered vinyl file object
		.pipe(gulpif(minify, uglify())) //minify JS
		.pipe($.rename({suffix: '.min'})) //rename output to include .min
		.pipe(gulp.dest(paths.scripts.dest)) //pipe to destination
		.pipe(browserSync.stream())
}

gulp.task('scripts',['eslint'],function(){
	return bundle();
});

//run jsx code through eslint
gulp.task('eslint', function(){
	return gulp.src(paths.scripts.src + '**/*.js')
		.pipe(eslint({
			baseConfig: {
				"parserOptions": {
					"ecmaFeatures": {
						"jsx": true,
						"modules": true
					}
				},
				"parser": "babel-eslint",
				"rules":{
					"eqeqeq": 1,
					"curly":1,
					"quotes": ["warn", "single"],					
					"curly": 1,
					"camelcase": 1,
					"globals": {
						"angular": 1,
						"React": 1,
						"$": 1,
						"jQuery": 1
					}					
				}
			}
		}))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
});

/* JS
gulp.task('scripts', ['scripts:moveFiles'], function() {
  return gulp.src(paths.scripts.src + '*.js')
	.pipe(babel())
    .pipe($.plumber(function(error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    .pipe($.bytediff.start())
    .pipe($.newer(paths.scripts.dest))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('main.js'))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.uglify())
    .pipe($.bytediff.stop())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
    //.pipe($.notify({ message: 'Scripts task complete' }));
});
*/

/* Move JS files that are already minified to hub/js/ folder */
gulp.task('scripts:moveFiles', function() {
    gulp.src(copyFiles.scripts, { base: './static/js/' })
    .pipe(gulp.dest(paths.scripts.dest));
});

/* Images */
gulp.task('images', function() {
  return gulp.src(paths.images.src + '**/*',{base: paths.images.src})
    .pipe($.plumber(function(error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    //.pipe($.bytediff.start()) //seems to be causing a problem with image reprocessing in subdirs on windows
    .pipe($.newer(paths.images.dest))
    .pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    //.pipe($.bytediff.stop()) //seems to be causing a problem with image reprocessing in subdirs on windows
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream())
    //.pipe($.notify({ message: 'Images task complete' }));
});

//copy and minify HTML files to dist
gulp.task('copyHtml',function(){
	return gulp.src(paths.templates.src + '*.html')
		.pipe($.htmlmin({collapseWhitespace:true, minifyJS: true, minifyCSS: true}))
		.pipe($.newer(paths.templates.dest))
		.on('error',function(e){
			const error = gutil.colors.red;
			gutil.log(error('Error in html:',e.message));
		})
		.pipe(gulp.dest(paths.templates.dest))
        .pipe(browserSync.stream())
});
/* HTML
gulp.task('copyHtml', function(){
    return gulp.src(paths.templates.src + "*.html")
        .pipe(gulp.dest(paths.templates.dest))
        .pipe(browserSync.stream())
        //.pipe($.notify({ message: 'HTML task complete' }));
});
*/

/* htaccess */
gulp.task('copyHtaccess', function(){
    return gulp.src(paths.templates.src + ".ht*")
        .pipe(gulp.dest(paths.templates.dest))
        .pipe(browserSync.stream())
});

gulp.task('copyBowerStuff',function(){
    gulp.src([paths.bower.src + '/**/*'])
    .pipe(gulp.dest(paths.bower.dest))
});

gulp.task('copyAssets',function(){
    gulp.src([paths.assets.src + '/**/*'])
    .pipe(gulp.dest(paths.assets.dest))
});


/* PHP 
gulp.task('copyPhp', function(){
    return gulp.src(paths.templates.src + "*.php")
        .pipe(gulp.dest(paths.templates.work))
        .pipe(browserSync.stream())
});
gulp.task('php', function() {
    php.server({
		base: './hub/',
		port: 8010,
		keepalive: true,
		//bin: 'C:/xampp/php/php.exe', //shouldn't need to set this unless your PHP dir isn't in your system path
	});
});
*/

/* BrowserSync */
gulp.task('browser-sync', ['styles', 'scripts', 'images', 'copyHtml', 'copyAssets', 'copyBowerStuff', 'copyHtaccess'], function() {
    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
        //Use if you don't want BS to open a tab in your browser when it starts up
        //open: false
        // Will not attempt to determine your network status, assumes you're OFFLINE
        //online: false
    });
/*
	browserSync({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false
    });
*/
    gulp.watch(paths.styles.src + '**/*.less', ['styles']);
    gulp.watch(paths.scripts.src + '**/*.js', ['scripts']);
    gulp.watch(paths.images.src + '**/*', ['images']);
    gulp.watch(paths.assets.src + '**/*', ['copyAssets']).on('change', browserSync.reload);
    gulp.watch(paths.templates.src + '*.html', ['copyHtml']).on('change', browserSync.reload);
});

gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
});

/* Clean up stray files */
gulp.task('cleanDest', ['clear'], function(cb) {
    $.del([basePaths.dest], cb)
});

/* Default task */
gulp.task('default', ['cleanDest'], function() {
    gulp.start('browser-sync');
});
