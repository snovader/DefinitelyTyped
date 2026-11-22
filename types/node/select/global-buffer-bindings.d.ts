declare module "node/select/buffer-bindings.js" {
    global {
        namespace NodeJS {
            export { BufferEncoding };
        }
        type BufferEncoding =
            | import("node:buffer").TranscodeEncoding
            | import("node/select/scoped-buffer.js").BinaryToTextEncoding;
        var Buffer: BufferConstructor;
    }
    export { Buffer, BufferConstructor, BufferEncoding };
    export import AllowSharedBuffer = globalThis.AllowSharedBuffer;
    export import NonSharedBuffer = globalThis.NonSharedBuffer;
    export import atob = globalThis.atob;
    export import btoa = globalThis.btoa;
    export import AbortSignal = globalThis.AbortSignal;
    export import ArrayBufferView = NodeJS.ArrayBufferView;
    export import ByteTypes = NodeJS;
    export import AsyncIterator = NodeJS.AsyncIterator;
    export import BufferSource = NodeJS.BufferSource;
    export import NonSharedArrayBufferView = NodeJS.NonSharedArrayBufferView;
    export import NonSharedUint8Array = NodeJS.NonSharedUint8Array;
    export import TypedArray = NodeJS.TypedArray;
    export type { TextDecoderCommon, TextDecoderOptions, TextEncoderCommon } from "node:util";
}
