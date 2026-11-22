/// <reference path="./buffer-core.d.ts" />
/// <reference path="../stream/web.d.ts" />

declare module "node:buffer" {
    import type { BufferSource, NonSharedBuffer, NonSharedUint8Array, TypedArray } from "node/select/buffer-bindings.js";
    import type { ReadableStream } from "node:stream/web";
    export { type AllowSharedBuffer, atob, btoa, Buffer, type NonSharedBuffer } from "node/select/buffer-bindings.js";
    /**
     * This function returns `true` if `input` contains only valid UTF-8-encoded data,
     * including the case in which `input` is empty.
     *
     * Throws if the `input` is a detached array buffer.
     * @since v19.4.0, v18.14.0
     * @param input The input to validate.
     */
    export function isUtf8(input: ArrayBuffer | TypedArray): boolean;
    /**
     * This function returns `true` if `input` contains only valid ASCII-encoded data,
     * including the case in which `input` is empty.
     *
     * Throws if the `input` is a detached array buffer.
     * @since v19.6.0, v18.15.0
     * @param input The input to validate.
     */
    export function isAscii(input: ArrayBuffer | TypedArray): boolean;
    export let INSPECT_MAX_BYTES: number;
    export const kMaxLength: number;
    export const kStringMaxLength: number;
    export const constants: {
        MAX_LENGTH: number;
        MAX_STRING_LENGTH: number;
    };
    export type TranscodeEncoding =
        | "ascii"
        | "utf8"
        | "utf-8"
        | "utf16le"
        | "utf-16le"
        | "ucs2"
        | "ucs-2"
        | "latin1"
        | "binary";
    /**
     * Re-encodes the given `Buffer` or `Uint8Array` instance from one character
     * encoding to another. Returns a new `Buffer` instance.
     *
     * Throws if the `fromEnc` or `toEnc` specify invalid character encodings or if
     * conversion from `fromEnc` to `toEnc` is not permitted.
     *
     * Encodings supported by `buffer.transcode()` are: `'ascii'`, `'utf8'`, `'utf16le'`, `'ucs2'`, `'latin1'`, and `'binary'`.
     *
     * The transcoding process will use substitution characters if a given byte
     * sequence cannot be adequately represented in the target encoding. For instance:
     *
     * ```js
     * import { Buffer, transcode } from 'node:buffer';
     *
     * const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
     * console.log(newBuf.toString('ascii'));
     * // Prints: '?'
     * ```
     *
     * Because the Euro (`€`) sign is not representable in US-ASCII, it is replaced
     * with `?` in the transcoded `Buffer`.
     * @since v7.1.0
     * @param source A `Buffer` or `Uint8Array` instance.
     * @param fromEnc The current encoding.
     * @param toEnc To target encoding.
     */
    export function transcode(
        source: Uint8Array,
        fromEnc: TranscodeEncoding,
        toEnc: TranscodeEncoding,
    ): NonSharedBuffer;
    /**
     * Resolves a `'blob:nodedata:...'` an associated `Blob` object registered using
     * a prior call to `URL.createObjectURL()`.
     * @since v16.7.0
     * @param id A `'blob:nodedata:...` URL string returned by a prior call to `URL.createObjectURL()`.
     */
    export function resolveObjectURL(id: string): Blob | undefined;
    export type WithImplicitCoercion<T> =
        | T
        | { valueOf(): T }
        | (T extends string ? { [Symbol.toPrimitive](hint: "string"): T } : never);

    // #region web types
    export type BlobPart = BufferSource | Blob | string;
    export interface BlobPropertyBag {
        endings?: "native" | "transparent";
        type?: string;
    }
    export interface FilePropertyBag extends BlobPropertyBag {
        lastModified?: number;
    }
    export interface Blob {
        readonly size: number;
        readonly type: string;
        arrayBuffer(): Promise<ArrayBuffer>;
        bytes(): Promise<NonSharedUint8Array>;
        slice(start?: number, end?: number, contentType?: string): Blob;
        stream(): ReadableStream<NonSharedUint8Array>;
        text(): Promise<string>;
        textStream(): ReadableStream<string>;
    }
    export var Blob: {
        prototype: Blob;
        new(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
    };
    export interface File extends Blob {
        readonly lastModified: number;
        readonly name: string;
        readonly webkitRelativePath: string;
    }
    export var File: {
        prototype: File;
        new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
    };
}
declare module "buffer" {
    export * from "node:buffer";
}
