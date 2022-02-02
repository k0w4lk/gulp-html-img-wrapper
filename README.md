# gulp-html-img-wrapper

Gulp plugin for wrapping the &lt;img> tag with &lt;picture> adding &lt;source> tag with .webp ext in HTML files.

## Install

```bash
npm i -D gulp-html-img-wrapper
```

## Main features

- Works with formatted tags (no need to write tag in one line)
- Ignores commented tags, existing picture tags, tags with empty or incorrect src attribute value
- Possibility not to wrap certain tag(s)
- Move class attribute from img tag to picture tag

## Example

**src/index.html**

```html
<img src="./img/image-placeholder.jpg" alt="image placeholder" />
```

**dist/index.html**

```html
<picture>
  <source srcset="./img/image-placeholder.webp" type="image/webp" />
  <img src="./img/image-placeholder.jpg" alt="image placeholder" />
</picture>
```

## Usage

```javascript
import gulpHtmlImgWrapper from 'gulp-html-img-wrapper';
/*
 * or
 * const gulpHtmlImgWrapper = require('gulp-html-img-wrapper');
 */

gulp.task('html', function () {
  gulp
    .src('./src/*.html')
    .pipe(
      gulpHtmlImgWrapper({
        classMove: false, // change for true to move class attribute from img tag to picture tag
        extensions: ['.jpg', '.png', '.jpeg'], // write your own extensions pack (case insensitive)
      })
    )
    .pipe(gulp.dest('./dest/'));
});
```

## Excluding from wrapping

Add to img tag `ghiw-exclude` attribute

**src/index.html**

```html
<img src="./img/image-placeholder.jpg" alt="image placeholder" ghiw-exclude />
```
