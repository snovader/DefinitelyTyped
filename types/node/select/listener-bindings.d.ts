import type { EventTarget } from "node/select/event-bindings.js";

type Listener = NonNullable<Parameters<EventTarget["addEventListener"]>[1]>;
export type EventListener = Extract<Listener, (...args: any[]) => void>;
export type EventListenerObject = Exclude<Listener, EventListener>;
export type AddEventListenerOptions = Exclude<Parameters<EventTarget["addEventListener"]>[2], boolean | undefined>;
