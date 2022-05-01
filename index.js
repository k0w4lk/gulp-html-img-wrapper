const gulpUtil = require('gulp-util');
const through = require('through2');
const log = require('fancy-log');

const pluginName = 'gulp-html-img-wrapper';

const PluginError = gulpUtil.PluginError;

const gulpHtmlImgWrapper = function (userParams) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);

      return;
    }

    if (file.isStream()) {
      cb(new PluginError(pluginName, 'Streaming not supported'));

      return;
    }

    try {
      const params = {
        extensions: ['.jpg', '.png', '.jpeg'],
        logger: true,
        ...userParams,
      };

      const EXCLUDE_ATTR = 'ghiw-exclude';

      const EXTENSION_REGEX = /(?<=src=[\'\"][\w\W]*)\.[\w]+(?=[\'\"])/i;
      const PICTURE_CLASS_REGEX =
        /<img[^>]*(pictureClass=([\"\']\S+[\"\']))[^>]*>/i;
      const IMG_SRC_REGEX = /<img[^>]*src=[\"\'](\S+)[\"\'][^>]*>/i;
      const IMG_REGEX = /<img[^>]*src=[\"|']([^\"\s]+)[\"|'][^>]*>/gi;
      const PICTURE_REGEX = /<\s*picture[^>]*>([\w\W]*?)<\s*\/\s*picture\s*>/gi;
      const COMMENTS_REGEX = /(?=<!--)([\s\S]*?)-->/gi;

      const data = file.contents.toString();

      let newHtml,
        wrappedImagesCount = 0;

      const comments = data.match(COMMENTS_REGEX);
      const noCommentsHtml = data.replace(
        COMMENTS_REGEX,
        `{{ ${pluginName}__insert-comment }}`
      );

      const pictures = noCommentsHtml.match(PICTURE_REGEX);
      const noPicturesHtml = noCommentsHtml.replace(
        PICTURE_REGEX,
        `{{ ${pluginName}__insert-picture }}`
      );

      const images = noPicturesHtml.match(IMG_REGEX);
      const noImagesHtml = noPicturesHtml.replace(
        IMG_REGEX,
        `{{ ${pluginName}__insert-image }}`
      );

      if (images) {
        newHtml = noImagesHtml;

        const newImages = images.map((image) => {
          if (image.includes(EXCLUDE_ATTR)) {
            if (PICTURE_CLASS_REGEX.test(image)) {
              const picClassAttr = image.match(PICTURE_CLASS_REGEX)[1];
              image = image.replace(picClassAttr, '');
            }
            return image.replace(EXCLUDE_ATTR, '');
          }

          if (EXTENSION_REGEX.test(image)) {
            const imageExt = image.match(EXTENSION_REGEX)[0];
            const srcValueWithoutExt = image
              .match(IMG_SRC_REGEX)[1]
              .replace(imageExt, '');
            let pictureClass;

            if (!params.extensions.includes(imageExt)) {
              return image;
            }

            if (PICTURE_CLASS_REGEX.test(image)) {
              pictureClass = image.match(PICTURE_CLASS_REGEX)[2];
              image = image.replace(`pictureClass=${pictureClass}`, '');
            }

            const newTag =
              '<picture' +
              `${pictureClass ? ' class=' + pictureClass : ''}` +
              '>' +
              '<source srcset="' +
              srcValueWithoutExt +
              '.webp" type="image/webp">' +
              image +
              '</picture>';

            wrappedImagesCount++;

            return newTag;
          }
          return image;
        });

        newImages.forEach((newImage) => {
          newHtml = newHtml.replace(
            `{{ ${pluginName}__insert-image }}`,
            newImage
          );
        });
      }

      if (pictures) {
        pictures.forEach((picture) => {
          newHtml = newHtml.replace(
            `{{ ${pluginName}__insert-picture }}`,
            picture
          );
        });
      }

      if (comments) {
        comments.forEach((comment) => {
          newHtml = newHtml.replace(
            `{{ ${pluginName}__insert-comment }}`,
            comment
          );
        });
      }

      file.contents = new Buffer.from(newHtml || data);
      this.push(file);

      if (wrappedImagesCount && params.logger) {
        const logMessage =
          wrappedImagesCount === 1 ? 'image was' : 'images were';
        log(`${pluginName}:`, `${wrappedImagesCount} ${logMessage} wrapped`);
      }
    } catch (err) {
      this.emit('error', new PluginError(pluginName, err));
    }
    cb();
  });
};

module.exports = gulpHtmlImgWrapper;
