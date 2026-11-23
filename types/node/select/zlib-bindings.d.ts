export type * as Scope from "./zlib-nodejs.js";
export type { Event, EventTarget, EventListenerOptions } from "./event-bindings.js";
export { type AsyncDisposable, type Disposable, Symbol } from "./disposal.js";

// The standalone Duplex inherits its disposal method directly from Readable.
export interface DuplexDisposal {}
