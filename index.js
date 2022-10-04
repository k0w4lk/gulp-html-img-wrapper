const log = require('fancy-log');
const pluginError = require('plugin-error');
const through = require('through2');

const pluginName = 'gulp-html-img-wrapper';

const gulpHtmlImgWrapper = function (userParams) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);

      return;
    }

    if (file.isStream()) {
      cb(new pluginError(pluginName, 'Streaming not supported'));

      return;
    }

    try {
      const params = {
        extensions: ['.jpg', '.png', '.jpeg'],
        logger: true,
        ...userParams,
      };

      const EXCLUDE_ATTR_REGEX = /<img[^>]*(ghiw-exclude)[^>]*>/i;
      const EXTENSION_REGEX = /(?<=src=[\'\"][\w\W]*)\.[\w]+(?=[\'\"])/i;
      const PICTURE_CLASS_REGEX =
        /<img[^>]*(ghiw-picture-class=([\"\'].+[\"\']))[^>]*>/i;
      const RESPONSIVE_FILENAMES_REGEX =
        /<img[^>]*(ghiw-responsive-filenames=[\"\'](.+)[\"\'])[^>]*>/i;
      const RESPONSIVE_MEDIA_REGEX =
        /<img[^>]*(ghiw-responsive-media=[\"\'](.+)[\"\'])[^>]*>/i;
      const RESPONSIVE_EXTENSIONS_REGEX =
        /<img[^>]*(ghiw-responsive-extensions=[\"\'](.+)[\"\'])[^>]*>/i;
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
          const ghiwExcludeAttr = image.match(EXCLUDE_ATTR_REGEX);
          const ghiwPictureClass = image.match(PICTURE_CLASS_REGEX);
          const ghiwResponsiveFilenames = image.match(
            RESPONSIVE_FILENAMES_REGEX
          );
          const ghiwResponsiveExtensions = image.match(
            RESPONSIVE_EXTENSIONS_REGEX
          );
          const ghiwResponsiveMedias = image.match(RESPONSIVE_MEDIA_REGEX);

          const removeCustomAttributes = (image) =>
            image
              .replace(ghiwExcludeAttr?.[1], '')
              .replace(ghiwPictureClass?.[1], '')
              .replace(ghiwResponsiveFilenames?.[1], '')
              .replace(ghiwResponsiveExtensions?.[1], '')
              .replace(ghiwResponsiveMedias?.[1], '');

          if (ghiwExcludeAttr) {
            return removeCustomAttributes(image);
          }

          if (EXTENSION_REGEX.test(image)) {
            const imageExt = image.match(EXTENSION_REGEX)[0];
            const srcValueWithoutExt = image
              .match(IMG_SRC_REGEX)[1]
              .replace(imageExt, '');

            if (!params.extensions.includes(imageExt)) {
              return removeCustomAttributes(image);
            }

            if (ghiwPictureClass) {
              image = image.replace(ghiwPictureClass[1], '');
            }

            if (
              RESPONSIVE_MEDIA_REGEX.test(image) &&
              RESPONSIVE_FILENAMES_REGEX.test(image) &&
              RESPONSIVE_EXTENSIONS_REGEX.test(image)
            ) {
              let sources = [];
              const extensions = image
                .match(RESPONSIVE_EXTENSIONS_REGEX)[2]
                .split(';')
                .map((ext) => ext.trim());

              const medias = image
                .match(RESPONSIVE_MEDIA_REGEX)[2]
                .split(';')
                .map((media) => media.trim());

              const filenames = image
                .match(RESPONSIVE_FILENAMES_REGEX)[2]
                .split(';')
                .map((filename) => filename.trim());

              extensions.forEach((ext) => {
                medias.forEach((media, index) => {
                  sources.push(
                    `<source srcset="${filenames[index]}.${ext}" media="(${media})" type="image/${ext}" />`
                  );
                });
              });

              image = removeCustomAttributes(image);

              const newTag = `<picture${
                ghiwPictureClass ? ' class=' + ghiwPictureClass[2] : ''
              }>${sources.join('')}${image}</picture>`;

              wrappedImagesCount++;

              return newTag;
            }

            const newTag = `<picture${
              ghiwPictureClass ? ' class=' + ghiwPictureClass[2] : ''
            }><source srcset="${srcValueWithoutExt}.webp" type="image/webp">${image}</picture>`;

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
        log(
          `${pluginName}:`,
          `${wrappedImagesCount} ${logMessage} wrapped in ${file.relative}`
        );
      }
    } catch (err) {
      this.emit('error', new pluginError(pluginName, err));
    }
    cb();
  });
};

module.exports = gulpHtmlImgWrapper;
