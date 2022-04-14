const gulp = require('gulp');
const del = require('del');
const formatHtml = require('gulp-format-html');
const gulpHtmlImgWrapper = require('../index.js');

const paths = {
  html: {
    src: './index.html',
    dist: './dist/',
  },
};

function clear() {
  return del([paths.html.dist]);
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(gulpHtmlImgWrapper())
    .pipe(formatHtml())
    .pipe(gulp.dest(paths.html.dist));
}

const build = gulp.series(clear, html);

exports.clear = clear;
exports.html = html;

exports.default = build;
