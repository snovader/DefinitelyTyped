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
