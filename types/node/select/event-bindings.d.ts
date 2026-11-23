import type * as Events from "./events.js";

export type { HostAbortSignal as AbortSignal } from "./stream-dependencies.js";
export type * as Scope from "./event-scope.js";
export type Event = typeof globalThis extends { Event: { prototype: infer T } } ? T : Events.Event;
export type EventTarget = typeof globalThis extends { EventTarget: { prototype: infer T } } ? T : Events.EventTarget;
export type EventListenerOptions = Exclude<Parameters<EventTarget["removeEventListener"]>[2], boolean | undefined>;

export { type AsyncDisposable, type Disposable, Symbol } from "./disposal.js";
