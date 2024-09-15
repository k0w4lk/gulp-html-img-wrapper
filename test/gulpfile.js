import gulp from "gulp";
import formatHtml from "gulp-format-html";
import { gulpHtmlImgWrapper } from "../build/index.js";
import { deleteAsync } from "del";

const paths = {
  html: {
    src: "./index.html",
    dist: "./dist/",
  },
};

export function clear() {
  return deleteAsync([paths.html.dist]);
}

export function html() {
  return gulp
    .src(paths.html.src)
    .pipe(gulpHtmlImgWrapper())
    .pipe(formatHtml())
    .pipe(gulp.dest(paths.html.dist));
}

const build = gulp.series(clear, html);

export default build;
