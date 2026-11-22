import type { Buffer } from "../../select/buffer-core.js";
export * as ByteTypes from "node/select/byte-types.js";
export { atob, btoa, type BufferEncoding } from "../../select/scoped-buffer.js";
export type { ArrayBufferView, BufferSource, NonSharedArrayBufferView, NonSharedUint8Array, TypedArray } from "node/select/byte-types.js";
export type { HostAbortSignal as AbortSignal, NodeAsyncIterator as AsyncIterator, TextDecoderCommon, TextDecoderOptions, TextEncoderCommon } from "../../select/stream-dependencies.js";

export { Buffer, type BufferConstructor } from "../../select/buffer-core.js";
export type NonSharedBuffer = Buffer;
export type AllowSharedBuffer = Buffer;
