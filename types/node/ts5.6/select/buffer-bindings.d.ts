export * as ByteTypes from "node/select/byte-types.js";
export { atob, btoa, type BufferEncoding } from "../../select/scoped-buffer.js";
export type { ArrayBufferView, BufferSource, NonSharedArrayBufferView, NonSharedUint8Array, TypedArray } from "node/select/byte-types.js";
export type { HostAbortSignal as AbortSignal, NodeAsyncIterator as AsyncIterator, TextDecoderCommon, TextDecoderOptions, TextEncoderCommon } from "../../select/stream-dependencies.js";

export interface BufferConstructor {}
export interface Buffer {}
export var Buffer: BufferConstructor;
export type NonSharedBuffer = Buffer;
export type AllowSharedBuffer = Buffer;
