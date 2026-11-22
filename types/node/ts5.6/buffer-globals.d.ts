/// <reference path="../legacy/buffer-version-ts5.6.d.ts" />
/// <reference path="../legacy/buffer-methods.d.ts" />
/// <reference path="../select/global-buffer-bindings.d.ts" />

export {};
declare global {
    type NonSharedBuffer = Buffer;
    type AllowSharedBuffer = Buffer;
}
