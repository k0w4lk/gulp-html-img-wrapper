const gulpUtil = require('gulp-util');
const through = require('through2');

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
        classMove: false,
        extensions: ['.jpg', '.png', '.jpeg'],
        ...userParams,
      };

      const EXTENSION_REGEX = /(?<=src=[\'\"][\w\W]*)\.[\w]+(?=[\'\"])/i;
      const IMG_CLASS_REGEX = /<img[^>]*(class=[\"\']\S+[\"\'])[^>]*>/i;
      const IMG_SRC_REGEX = /<img[^>]*src=[\"\'](\S+)[\"\'][^>]*>/i;
      const IMG_REGEX = /<img[^>]*src=[\"|']([^\"\s]+)[\"|'][^>]*>/gi;
      const PICTURE_REGEX = /<\s*picture[^>]*>([\w\W]*?)<\s*\/\s*picture\s*>/gi;
      const COMMENTS_REGEX =
        /<\s*picture[^>]*>([\w\W]*?)<\s*\/\s*picture\s*>/gi;

      const data = file.contents.toString();

      const comments = data.match(COMMENTS_REGEX);
      const pictures = data.match(PICTURE_REGEX);
      const images = data.match(IMG_REGEX);

      const noCommentsHtml = data.replace(
        COMMENTS_REGEX,
        `{{ ${pluginName}__insert-comment }}`
      );

      const noPicturesHtml = noCommentsHtml.replace(
        PICTURE_REGEX,
        `{{ ${pluginName}__insert-picture }}`
      );

      const noImagesHtml = noPicturesHtml.replace(
        IMG_REGEX,
        `{{ ${pluginName}__insert-image }}`
      );

      const newImages = images.map((image) => {
        if (EXTENSION_REGEX.test(image)) {
          const imageExt = image.match(EXTENSION_REGEX)[0];
          const srcValueWithoutExt = image
            .match(IMG_SRC_REGEX)[1]
            .replace(EXTENSION_REGEX, '');
          let classAttr;

          if (!params.extensions.includes(imageExt)) {
            return image;
          }

          if (params.classMove) {
            if (IMG_CLASS_REGEX.test(image)) {
              classAttr = image.match(IMG_CLASS_REGEX)[1];
              image = image.replace(classAttr, '');
            }
          }

          return (
            '<picture' +
            `${classAttr ? ' ' + classAttr : ''}` +
            '>' +
            '<source srcset=' +
            srcValueWithoutExt +
            ".webp type='image/webp'>" +
            image +
            '</picture>'
          );
        }
        return image;
      });

      let newHtml = noImagesHtml;

      newImages.forEach((newImage) => {
        newHtml = newHtml.replace(
          `{{ ${pluginName}__insert-image }}`,
          newImage
        );
      });

      pictures.forEach((picture) => {
        newHtml = newHtml.replace(
          `{{ ${pluginName}__insert-picture }}`,
          picture
        );
      });

      comments.forEach((comment) => {
        newHtml = newHtml.replace(
          `{{ ${pluginName}__insert-comment }}`,
          comment
        );
      });

      file.contents = new Buffer.from(newHtml);
      this.push(file);
    } catch (err) {
      this.emit('error', new PluginError(pluginName, err));
    }
    cb();
  });
};

module.exports = gulpHtmlImgWrapper;
