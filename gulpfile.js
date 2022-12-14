const {
        src,
        dest,
        watch,
        parallel,
        series,
        lastRun
    } = require('gulp'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    sourcemaps = require("gulp-sourcemaps"),
    browsersync = require("browser-sync").create(),
    changed = require("gulp-changed"),
    concat = require('gulp-concat'),
    beautify = require('gulp-beautify'),
    plumber = require('gulp-plumber'),
    del = require('del'),
    imagemin = require('gulp-imagemin')
    nj = require('gulp-nunjucks-render')


const path = {
    html: "src/html/*.+(html|njk|nunj)",
    css: 'src/css/*.+(css|scss)',
    cssLibrary: 'src/css/library/**/*.+(css|css.map|scss)',
    js: 'src/js/*.js',
    jsLibrary: 'src/js/library/*',
    images: "src/images/*",
    videos: "scr/videos/*",
    font: "src/fonts/**/*"
}

function clean() {
    return del(['dist']);
}

function localServer(cb) {
    browsersync.init({
        server: {
            baseDir: 'dist',
            index: 'index.html'
        },
        port: 5000
    });
    cb()
}

function browserReload(cb) {
    browsersync.reload();
    cb();
}


function handleHTML() {
    return src(path.html)
        .pipe(changed(path.html))
        .pipe(plumber())
        .pipe(nj({
            path: ['src/html'],
        }))
        .pipe(beautify.html({
            indent_size: 2,
            max_preserve_newlines: 1,
        }))
        .pipe(dest('dist'))
}


function handleStyle() {
    return src(path.css)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/css'))
}

function handleCssLibrary() {
    return src(path.cssLibrary, {since: lastRun(handleCssLibrary)})
        .pipe(sass())
        // .pipe(concat('vendor.css'))
        .pipe(dest('dist/css/library'));
}

function handleImages() {
    return src(path.images, {since: lastRun(handleImages)})
        .pipe(imagemin([
            imagemin.gifsicle({
                optimizationLevel: 3,
                optimize: 3,
                lossy: 2,
                interlaced: true
            }),
            imagemin.mozjpeg({quality: 90, progress: true}),
            imagemin.optipng({
                speed: 5, quality: [0.6, 0.8]
            }),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {removeUnusedNS: false},
                    {removeUselessStrokeAndFill: false},
                    {cleanupIDs: false},
                    {removeComments: true},
                    {removeEmptyAttrs: true},
                    {removeEmptyText: true},
                    {collapseGroups: true},
                ]
            }),
        ]))
        .pipe(changed(path.images))
        .pipe(dest('dist/images'))
}


function handleVideos() {
    return src(path.videos, {since: lastRun(handleVideos)})
        .pipe(changed(path.videos))

        .pipe(dest("dis/fonts"))
}


function handleFonts() {
    return src(path.font, {since: lastRun(handleFonts)})
        .pipe(changed(path.font))
        .pipe(dest('dist/fonts'))
}


function handleJs() {
    return src(path.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            'presets': ['@babel/preset-env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/js'))
}

function handleJsLibrary() {
    return src(path.jsLibrary, {since: lastRun(handleJsLibrary)})
        .pipe(concat('vendor.js'))
        .pipe(dest('dist/js'))
}


function watchFiles() {
    watch(
        ['src/html/**/*.+(html|njk|nunj)', path.html, path.css, path.js],
        series(parallel(handleHTML, handleStyle, handleJs,), browserReload)
    );
    watch([path.cssLibrary, path.jsLibrary], series(parallel(handleCssLibrary, handleJsLibrary), browserReload));
    watch([path.images], series(handleImages, browserReload));
    watch([path.font], series(handleFonts, browserReload));
}


exports.serve = series(
    clean,
    handleImages,
    handleFonts,
    handleHTML,
    handleStyle,
    handleCssLibrary,
    handleJsLibrary,
    handleJs,
    localServer,
    watchFiles
);


function build(cb) {
    cb()
}


exports.build = build















