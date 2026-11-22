/// <reference path="./select/global-buffer-bindings.d.ts" />

export {};
declare global {
    type NonSharedBuffer = Buffer<ArrayBuffer>;
    type AllowSharedBuffer = Buffer<ArrayBufferLike>;
}
