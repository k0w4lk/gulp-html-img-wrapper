/// <reference types="node" />

import stream = require("stream");

export interface UserParams {
  extensions?: string[];
  logger?: boolean;
}

export function gulpHtmlImgWrapper(userParams?: UserParams): stream.Transform;
