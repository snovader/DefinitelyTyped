/// <reference path="../select/global-buffer-bindings.d.ts" />

export {};
declare global {
    type NonSharedBuffer = Buffer;
    type AllowSharedBuffer = Buffer;
}
