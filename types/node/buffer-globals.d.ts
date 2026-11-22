/// <reference path="./legacy/buffer-version.d.ts" />
/// <reference path="./legacy/buffer-methods.d.ts" />
/// <reference path="./select/global-buffer-bindings.d.ts" />

export {};
declare global {
    type NonSharedBuffer = Buffer<ArrayBuffer>;
    type AllowSharedBuffer = Buffer<ArrayBufferLike>;
}
