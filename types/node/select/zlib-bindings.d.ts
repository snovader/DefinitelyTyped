import type * as Events from "./events.js";

export type * as Scope from "./zlib-nodejs.js";
export type Event = typeof globalThis extends { Event: { prototype: infer T } } ? T : Events.Event;
export type EventTarget = typeof globalThis extends { EventTarget: { prototype: infer T } } ? T : Events.EventTarget;
export type EventListenerOptions = Exclude<Parameters<EventTarget["removeEventListener"]>[2], boolean | undefined>;

// Older ES libraries have no disposal keys. Keep the fallbacks local to this selector.
export const Symbol: typeof globalThis.Symbol extends { readonly dispose: symbol; readonly asyncDispose: symbol }
    ? typeof globalThis.Symbol
    : typeof globalThis.Symbol & { readonly dispose: unique symbol; readonly asyncDispose: unique symbol };
export interface Disposable {
    [Symbol.dispose](): void;
}
export interface AsyncDisposable {
    [Symbol.asyncDispose](): PromiseLike<void>;
}
