const gulp = require('gulp');
const gulpHtmlImgWrapper = require('../index.js');
const del = require('del');

const paths = {
  html: {
    src: './index.html',
    dest: './dest/',
  },
};

function clear() {
  return del([paths.html.dest]);
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(
      gulpHtmlImgWrapper({
        classMove: false,
        extensions: ['.jpg', '.png', '.jpeg'],
      })
    )
    .pipe(gulp.dest(paths.html.dest));
}

const build = gulp.series(clear, html);

exports.clear = clear;
exports.html = html;

exports.default = build;
