import logger from "fancy-log";
import { JSDOM } from "jsdom";
import PluginError from "plugin-error";
import through2 from "through2";

interface UserParams {
  extensions?: string[];
  logger?: boolean;
}

const pluginName = "gulp-html-img-wrapper";

const attrs = {
  exclude: "ghiw-exclude",
  pictureClass: "ghiw-picture-class",
  responsiveFilenames: "ghiw-responsive-filenames",
  responsiveMedia: "ghiw-responsive-media",
  responsiveExtensions: "ghiw-responsive-extensions",
};

export const gulpHtmlImgWrapper = function (userParams: UserParams = {}) {
  return through2.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);

      return;
    }

    if (file.isStream()) {
      cb(new PluginError(pluginName, "Streaming not supported"));

      return;
    }

    try {
      const params: UserParams = {
        extensions: ["jpg", "png", "jpeg"],
        logger: true,
        ...userParams,
      };

      const imageExtRegExp = new RegExp(
        `\.(${params.extensions?.join("|")})$`,
        "i"
      );

      const fileHTML: string = file.contents.toString();

      const document = new JSDOM(fileHTML).window.document;

      let wrappedImagesCount = 0;

      const images = document.querySelectorAll("img");

      const removeCustomAttributes = (
        image: HTMLImageElement
      ): HTMLImageElement => {
        image.removeAttribute(attrs.exclude);
        image.removeAttribute(attrs.pictureClass);
        image.removeAttribute(attrs.responsiveFilenames);
        image.removeAttribute(attrs.responsiveMedia);
        image.removeAttribute(attrs.responsiveExtensions);

        return image;
      };

      images.forEach((image) => {
        const imageExt = image.src.match(imageExtRegExp)?.[1];

        const imageAlreadyInPicture =
          image.parentNode?.nodeName?.toLowerCase() === "picture";
        const imageExcluded = image.hasAttribute(attrs.exclude);
        const imageHasUndeclaredExt = !params.extensions?.includes(
          imageExt || ""
        );

        if (
          imageAlreadyInPicture ||
          imageExcluded ||
          !imageExt ||
          imageHasUndeclaredExt
        ) {
          removeCustomAttributes(image);

          return;
        }

        const picture = document.createElement("picture");
        const imagePathWithoutExt = image.src.replace(`.${imageExt}`, "");

        if (image.hasAttribute(attrs.pictureClass)) {
          picture.classList.add(
            ...image.getAttribute(attrs.pictureClass)!.split(" ")
          );
        }

        if (
          image.hasAttribute(attrs.responsiveMedia) &&
          image.hasAttribute(attrs.responsiveFilenames) &&
          image.hasAttribute(attrs.responsiveExtensions)
        ) {
          const extensions = image
            .getAttribute(attrs.responsiveExtensions)!
            .split(";")
            .map((ext) => ext.trim());

          const medias = image
            .getAttribute(attrs.responsiveMedia)!
            .split(";")
            .map((ext) => ext.trim());

          const filenames = image
            .getAttribute(attrs.responsiveFilenames)!
            .split(";")
            .map((ext) => ext.trim());

          extensions.forEach((ext) => {
            medias.forEach((media, index) => {
              const source = document.createElement("source");

              source.srcset = `${filenames[index]}.${ext}`;
              source.media = `(${media})`;
              source.type = `image/${ext}`;

              picture.append(source);
            });
          });
        } else {
          const source = document.createElement("source");

          source.srcset = `${imagePathWithoutExt}.webp`;
          source.type = "image/webp";

          picture.append(source);
        }

        removeCustomAttributes(image);

        picture.append(image.cloneNode());

        image.replaceWith(picture);

        wrappedImagesCount++;
      });

      file.contents = Buffer.from(document.documentElement.outerHTML);

      this.push(file);

      if (params.logger && wrappedImagesCount) {
        const logMessage =
          wrappedImagesCount === 1 ? "image was" : "images were";
        logger(
          `${pluginName}:`,
          `${wrappedImagesCount} ${logMessage} wrapped in ${file.relative}`
        );
      }
    } catch (err) {
      this.emit("error", new PluginError(pluginName, err as Error));
    }

    cb();
  });
};
