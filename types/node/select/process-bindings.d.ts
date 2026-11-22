import type { EventTarget } from "node/select/zlib-bindings.js";

export type * as Scope from "./process-scope.js";
export type { ImportAttributes, ImportPhase, MessageEvent } from "./process-web.js";
type Listener = NonNullable<Parameters<EventTarget["addEventListener"]>[1]>;
export type EventListener = Extract<Listener, (...args: any[]) => void>;
export type EventListenerObject = Exclude<Listener, EventListener>;
export type AddEventListenerOptions = Exclude<Parameters<EventTarget["addEventListener"]>[2], boolean | undefined>;

declare function clone<T = any>(value: T, options?: import("node:worker_threads").StructuredSerializeOptions): T;
export const structuredClone: typeof globalThis extends { structuredClone: infer F } ? F & typeof clone : typeof clone;
