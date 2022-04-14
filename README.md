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
- Adds a class for the picture tag after building the project using a special attribute from img tag in the source code

## Example

**src/index.html**

```html
<img
  src="./img/image-placeholder.jpg"
  alt="image placeholder"
  class="image"
  pictureClass="picture"
/>
```

**dist/index.html**

```html
<picture class="picture">
  <source srcset="./img/image-placeholder.webp" type="image/webp" />
  <img
    src="./img/image-placeholder.jpg"
    alt="image placeholder"
    class="image"
  />
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
        logger: true, // false for not showing message with amount of wrapped img tags for each file
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
