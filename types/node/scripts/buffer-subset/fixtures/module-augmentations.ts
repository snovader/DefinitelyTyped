import { captureRejectionSymbol, EventEmitter } from "node:events";
import { createRequire } from "node:module";
import { Duplex } from "node:stream";
import { clearTimeout, setImmediate, setTimeout } from "node:timers";
import { transferableAbortController } from "node:util";
import { WebSocket } from "node:http";

declare global {
    namespace NodeJS {
        interface EventEmitter<T> {
            [captureRejectionSymbol]?(error: Error, event: "fixture"): 17;
        }
        interface Require { (id: "fixture-module"): { id: 1 } }
        interface Timeout { refresh(): this & { refreshed: true } }
        interface Immediate { fixture: 17 }
    }
    interface AbortController { fixture: "controller" }
}

export const rejection = new EventEmitter()[captureRejectionSymbol]?.(new Error(), "fixture");
export const load = createRequire("/fixture.cjs");
export const loaded = load("fixture-module");
export const handle = setTimeout(() => {}, 10);
export const refreshed = handle.refresh();
export const refresh = handle.refresh;
export const immediate = setImmediate(() => {}).fixture;
export const abort = transferableAbortController().fixture;
export const websocket = new WebSocket("ws://localhost");
clearTimeout(handle);

declare module "node:stream" {
    interface Duplex {
        [Symbol.asyncDispose](): Promise<never>;
    }
}
export const dispose = new Duplex()[Symbol.asyncDispose];
