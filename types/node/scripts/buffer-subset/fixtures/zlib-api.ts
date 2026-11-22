import { Buffer as NodeBuffer } from "node:buffer";
import { type Abortable, addAbortListener, EventEmitter } from "node:events";
import { PassThrough, Transform } from "node:stream";
import { finished } from "node:stream/promises";
import { createGzip, gzipSync, ZipBuffer, type ZipEntry, type ZlibOptions } from "node:zlib";
import { gunzipSync } from "zlib";

export const bytes = gzipSync("payload");
export const decoded = gunzipSync(bytes);
const sameBuffer: NodeBuffer = bytes;
const compressor: Transform = createGzip();
export const output = compressor.pipe(new PassThrough());
export const done = finished(output);
export const dictionary: ZlibOptions = { dictionary: NodeBuffer.from("header") };
export const entries = (zip: ZipBuffer) => zip.entries();
export const contents = (entry: ZipEntry) => entry.contentIterator({});
export const pipe = createGzip().pipe;
const emitter = new EventEmitter<{ bytes: [NodeBuffer] }>();
emitter.on("bytes", value => value.readUInt8());
emitter.emit("bytes", sameBuffer);
// @ts-expect-error - The typed event carries a Buffer.
emitter.emit("bytes", "payload");

export const subscribe = emitter.on;
export const subscribeStream = createGzip().on;
export const signalOf = (options: Abortable) => options.signal;
export const listen = (signal: NonNullable<Abortable["signal"]>) => addAbortListener(signal, () => {});
