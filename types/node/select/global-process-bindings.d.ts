/// <reference path="./global-emitted-types.d.ts" />
declare module "node/select/process-bindings.js" {
    export import AddEventListenerOptions = globalThis.AddEventListenerOptions;
    export import EventListener = globalThis.EventListener;
    export import EventListenerObject = globalThis.EventListenerObject;
    export import Scope = NodeJS;
    export type { ImportAttributes, ImportPhase } from "node:module";
    export type { MessageEvent } from "node/select/undici.js";
    export import structuredClone = globalThis.structuredClone;
}
declare module "node/select/process-value.js" {
    export = process;
}
