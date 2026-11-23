declare module "node/select/array-bindings.js" {
    export import Scope = NodeJS;
}
declare module "node/select/runtime-bindings.js" {
    export import Scope = NodeJS;
}
declare module "node/select/float16-bindings.js" {
    export import Float16Array = globalThis.Float16Array;
}
declare module "node/select/abort-bindings.js" {
    export import AbortController = globalThis.AbortController;
}
declare module "node/select/headers-bindings.js" {
    export import Headers = globalThis.Headers;
}
declare module "node/select/import-meta-bindings.js" {
    export import ImportMeta = globalThis.ImportMeta;
}
declare module "node/select/timer-functions.js" {
    export import clearImmediate = globalThis.clearImmediate;
    export import clearInterval = globalThis.clearInterval;
    export import clearTimeout = globalThis.clearTimeout;
    export import setImmediate = globalThis.setImmediate;
    export import setInterval = globalThis.setInterval;
    export import setTimeout = globalThis.setTimeout;
}
declare module "node/select/disposal.js" {
    export import RunScopeDisposable = globalThis.Disposable;
    export import Disposable = globalThis.Disposable;
    export import AsyncDisposable = globalThis.AsyncDisposable;
    export import Symbol = globalThis.Symbol;
}
declare module "node/select/stream-web-bindings.js" {
    export { AbortSignal, AsyncIterator, BufferSource, ByteTypes, NonSharedArrayBufferView, NonSharedUint8Array, TextDecoderCommon, TextDecoderOptions, TextEncoderCommon } from "node/select/buffer-bindings.js";
}
declare module "node/select/child-process-bindings.js" {
    export import Scope = NodeJS;
}
declare module "node/select/base-bindings.js" {
    export import Scope = NodeJS;
}
declare module "node/select/event-bindings.js" {
    export import AbortSignal = globalThis.AbortSignal;
    export { AsyncDisposable, Disposable, Event, EventListenerOptions, EventTarget, Scope, Symbol } from "node/select/zlib-bindings.js";
}
declare module "node/select/listener-bindings.js" {
    export { AddEventListenerOptions, EventListener, EventListenerObject } from "node/select/process-bindings.js";
}
declare module "node/select/http-bindings.js" {
    export { CloseEvent, MessageEvent, WebSocket } from "node/select/undici.js";
}
