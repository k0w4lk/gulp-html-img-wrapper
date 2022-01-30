const gulpUtil = require('gulp-util');
const through = require('through2');

const pluginName = 'gulp-html-img-wrapper';

const PluginError = gulpUtil.PluginError;

const gulpHtmlImgWrapper = function (userExtensions) {
  const extensions = userExtensions || [
    'jpg',
    'png',
    'jpeg',
    'JPG',
    'PNG',
    'JPEG',
  ];

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
      const CLASS_REGEX =
        /(?:class)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gim;
      const EXTENSION_REGEX = /[^\\]*\.(\w+)$/i;
      const IMG_REGEX = /<img([^>]*)src=[\"\'](\S+)[\"\']([^>]*)>/;
      const PICTURE_REGEX = /([\s\S]*?<\/picture>)([\s\S]*)/;
      const IMG_SPLITTER = '<img ';
      const PICTURE_SPLITTER = '<picture>';

      const data = file.contents
        .toString()
        .split(PICTURE_SPLITTER)
        .map(function (line) {
          let picture = '';

          if (PICTURE_REGEX.test(line)) {
            const lineA = line.match(PICTURE_REGEX);
            picture = lineA[1];
            line = lineA[2];
          }

          if (~line.indexOf(IMG_SPLITTER)) {
            const lineNew = line
              .split(IMG_SPLITTER)
              .map(function (subLine) {
                const lineImg = IMG_SPLITTER + subLine;

                if (IMG_REGEX.test(lineImg)) {
                  const regexpArray = lineImg.match(IMG_REGEX);
                  const imgTag = regexpArray[0];
                  const url = regexpArray[2];
                  const urlExt = url.match(EXTENSION_REGEX)[1];
                  if (!~url.indexOf('.webp')) {
                    let newHtml;
                    if (extensions.includes(urlExt)) {
                      let newImgTag = imgTag;
                      let newUrl = url.replace(urlExt, 'webp');
                      let imgClass = newImgTag.match(CLASS_REGEX)?.[0];

                      if (imgClass !== undefined) {
                        newImgTag = newImgTag.replace(imgClass, '');
                        imgClass = ' ' + imgClass;
                      } else {
                        imgClass = '';
                      }

                      newHtml =
                        '<picture' +
                        imgClass +
                        '><source srcset="' +
                        newUrl +
                        '" type="image/webp">' +
                        newImgTag +
                        '</picture>';
                    } else {
                      newHtml = imgTag;
                    }
                    subLine = lineImg.replace(imgTag, newHtml);
                  }
                }
                return subLine;
              })
              .join('');
            line = lineNew;
          }
          return picture + line;
        })
        .join(PICTURE_SPLITTER);

      file.contents = new Buffer.from(data);
      this.push(file);
    } catch (err) {
      this.emit('error', new PluginError(pluginName, err));
    }
    cb();
  });
};

module.exports = gulpHtmlImgWrapper;
