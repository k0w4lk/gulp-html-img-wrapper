# gulp-html-img-wrapper

Gulp plugin for wrapping in HTML files the &lt;img> tag with &lt;picture> adding single &lt;source> tag with .webp extension by default or multiple using responsive images approach.

## Install

```bash
npm i -D gulp-html-img-wrapper
```

## Main features

- Works with formatted tags (no need to write tag in one line).
- Ignores commented tags, existing picture tags, tags with empty or incorrect src attribute value.
- Possibility not to wrap certain tag.
- Adds a class for the picture tag after building the project using a special attribute from img tag in the source code.
- Could set multiple sources to make images responsive according to media queries.

## NOTE!

- Images with the same name but different extensions should be placed in the same folder.

## Examples:

<br />

### Basic

<br />

**src/index.html**

```html
<img
  src="./img/image-placeholder.jpg"
  alt="image placeholder"
  class="image"
  ghiw-picture-class="picture"
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

<br />

### Excluding from wrapping.

Add to img tag `ghiw-exclude` attribute.

<br />

**src/index.html**

```html
<img src="./img/image-placeholder.jpg" alt="image placeholder" ghiw-exclude />
```

**dist/index.html**

```html
<img src="./img/image-placeholder.jpg" alt="image placeholder" />
```

<br />

### Responsive images.

Add to img tag `ghiw-responsive-filenames`, `ghiw-responsive-media`, `ghiw-responsive-extensions` attributes with values divided by semicolon, which are: names of files without extensions you want to use as responsive images, media queries which amount should be equal to amount of filenames, extensions of files you want to see in source's type attribute.

<br />

**src/index.html**

```html
<img
  src="image.jpeg"
  alt="image"
  class="image"
  ghiw-responsive-filenames="image1; image2"
  ghiw-responsive-media="max-width: 799px; min-width: 800px"
  ghiw-responsive-extensions="avif; webp"
/>s
```

**dist/index.html**

```html
<picture>
  <source srcset="image1.avif" media="(max-width: 799px)" type="image/avif" />
  <source srcset="image2.avif" media="(min-width: 800px)" type="image/avif" />
  <source srcset="image1.webp" media="(max-width: 799px)" type="image/webp" />
  <source srcset="image2.webp" media="(min-width: 800px)" type="image/webp" />
  <img src="image.jpeg" alt="image" class="image" />
</picture>
```

<br />

### Gulpfile

<br />

**src/gulpfile.js**

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
