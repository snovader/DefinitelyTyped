import { bytes, entries, output, pipe } from "./zlib-emitted.js";
import { createGzip, type ZipBuffer } from "node:zlib";
export const size = bytes.readUInt8();
export const result = output.pipe(createGzip());
export const keys = (archive: ZipBuffer) => entries(archive).next();
export const pipeMethod: typeof pipe = createGzip().pipe;
