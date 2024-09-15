import logger from "fancy-log";
import { JSDOM } from "jsdom";
import PluginError from "plugin-error";
import through2 from "through2";

interface UserParams {
  extensions?: string[];
  logger?: boolean;
}

const pluginName = "gulp-html-img-wrapper";

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
        image.removeAttribute("ghiw-exclude");
        image.removeAttribute("ghiw-picture-class");
        image.removeAttribute("ghiw-responsive-filenames");
        image.removeAttribute("ghiw-responsive-media");
        image.removeAttribute("ghiw-responsive-extensions");

        return image;
      };

      let used = 0;

      images.forEach((image) => {
        if (image.parentNode?.nodeName?.toLowerCase() === "picture") return;

        if (image.hasAttribute("ghiw-exclude")) {
          removeCustomAttributes(image);

          return;
        }

        const imageExt = image.src.match(imageExtRegExp)?.[1];

        if (!imageExt || !params.extensions?.includes(imageExt)) {
          removeCustomAttributes(image);

          return;
        }

        used++;

        const picture = document.createElement("picture");
        const imagePathWithoutExt = image.src.replace(`.${imageExt}`, "");

        if (image.hasAttribute("ghiw-picture-class")) {
          picture.classList.add(
            ...image.getAttribute("ghiw-picture-class")!.split(" ")
          );

          image.removeAttribute("ghiw-picture-class");
        }

        if (
          image.hasAttribute("ghiw-responsive-media") &&
          image.hasAttribute("ghiw-responsive-filenames") &&
          image.hasAttribute("ghiw-responsive-extensions")
        ) {
          const extensions = image
            .getAttribute("ghiw-responsive-extensions")!
            .split(";")
            .map((ext) => ext.trim());

          const medias = image
            .getAttribute("ghiw-responsive-media")!
            .split(";")
            .map((ext) => ext.trim());

          const filenames = image
            .getAttribute("ghiw-responsive-filenames")!
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

        image = removeCustomAttributes(image);

        const clone = image.cloneNode();

        picture.append(clone);

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
