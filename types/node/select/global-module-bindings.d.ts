/// <reference path="./global-emitted-types.d.ts" />
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
declare module "node/select/env/headers" {
    export import Headers = globalThis.Headers;
}
declare module "node/select/import-meta-bindings.js" {
    export import ImportMeta = globalThis.ImportMeta;
}
declare module "node/select/env/timers" {
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
declare module "node/select/env/http" {
    export { CloseEvent, MessageEvent, WebSocket } from "node/select/env/undici";
}

declare module "node/select/fs-bindings.js" {
    export type { URL } from "node:url";
    export import GlobalURL = globalThis.URL;
    export import Blob = globalThis.Blob;
}

declare module "node/select/process-bindings.js" {
    export import AddEventListenerOptions = globalThis.AddEventListenerOptions;
    export import EventListener = globalThis.EventListener;
    export import EventListenerObject = globalThis.EventListenerObject;
    export import Scope = NodeJS;
    export type { ImportAttributes, ImportPhase } from "node:module";
    export type { MessageEvent } from "node/select/env/undici";
    export import structuredClone = globalThis.structuredClone;
}
declare module "node/select/process-value.js" {
    export = process;
}

declare module "node/select/zlib-bindings.js" {
    // Preserve the global key when TypeScript emits an inferred class derived from Duplex.
    export interface DuplexDisposal {
        [Symbol.asyncDispose]: import("node:stream").Readable[typeof Symbol.asyncDispose];
    }
    export import Scope = NodeJS;
    export import Symbol = globalThis.Symbol;
    export import Disposable = globalThis.Disposable;
    export import AsyncDisposable = globalThis.AsyncDisposable;
    export import Event = globalThis.Event;
    export import EventTarget = globalThis.EventTarget;
    export import EventListenerOptions = globalThis.EventListenerOptions;
}

// Preserve the names that earlier standalone declarations could emit.
declare module "node/select/http-bindings.js" {
    export * from "node/select/env/http";
}

declare module "node/select/headers-bindings.js" {
    export * from "node/select/env/headers";
}

declare module "node/select/timer-functions.js" {
    export * from "node/select/env/timers";
}
