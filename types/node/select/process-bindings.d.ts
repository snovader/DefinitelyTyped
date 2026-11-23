export type * as Scope from "./process-scope.js";
export type { ImportAttributes, ImportPhase, MessageEvent } from "./process-web.js";
export type { AddEventListenerOptions, EventListener, EventListenerObject } from "./listener-bindings.js";

declare function clone<T = any>(value: T, options?: import("node:worker_threads").StructuredSerializeOptions): T;
export const structuredClone: typeof globalThis extends { structuredClone: infer F } ? F & typeof clone : typeof clone;
