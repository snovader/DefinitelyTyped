import { Blob, Buffer as NodeBuffer, constants, File, isAscii, isUtf8, transcode } from "node:buffer";
import { Buffer as BareBuffer } from "buffer";
import type { ReadableStream } from "node:stream/web";

// Exercise both the shared API and the compiler-specific constructor/instance overloads.
const encoded = NodeBuffer.from("hello", "utf8");
const alias: BareBuffer = encoded;
alias.writeBigUInt64BE(42n);
const integer: bigint = alias.readBigUInt64BE();
const size: number = constants.MAX_LENGTH;
const valid: boolean = isAscii(encoded) && isUtf8(new Uint16Array());
const file = new File([encoded], "hello.txt");
const stream: ReadableStream<string> = file.textStream();
new Blob([transcode(encoded, "utf8", "ascii")]).stream().getReader().read();
export { encoded, integer, size, stream, valid };

// @ts-expect-error - Unknown encodings must still be rejected.
NodeBuffer.from("hello", "utf9");
// @ts-expect-error - Only the import introduces the Buffer value.
Buffer.from("hello");
// @ts-expect-error - No unqualified Buffer type.
type UnqualifiedBuffer = Buffer;
// @ts-expect-error - No unqualified encoding alias.
type Encoding = BufferEncoding;
// @ts-expect-error - No NodeJS namespace.
type ProcessType = NodeJS.Process;
// @ts-expect-error - No Node process global.
process.cwd();
// @ts-expect-error - No CommonJS globals.
require("node:fs");
// @ts-expect-error - Buffer does not install a Node timer.
setImmediate(() => {});
// @ts-expect-error - No augmentation of ES ErrorConstructor.
Error.captureStackTrace({});
// @ts-expect-error - fs is outside the Buffer dependency graph.
import type { Stats } from "node:fs";
// @ts-expect-error - zlib is outside the Buffer dependency graph.
import type { ZlibOptions } from "node:zlib";
