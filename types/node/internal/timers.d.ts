/// <reference path="../events.d.ts" />
/// <reference path="./timers/promises.d.ts" />
declare module "node:timers" {
    import { clearImmediate, clearInterval, clearTimeout, setImmediate, setInterval, setTimeout } from "node/select/env/timers";
    import { Abortable } from "node:events";
    import * as promises from "node:timers/promises";
    export interface TimerOptions extends Abortable {
        /**
         * Set to `false` to indicate that the scheduled `Timeout`
         * should not require the Node.js event loop to remain active.
         * @default true
         */
        ref?: boolean | undefined;
    }
    export { clearImmediate, clearInterval, clearTimeout, promises, setImmediate, setInterval, setTimeout };
}
declare module "timers" {
    export * from "node:timers";
}

declare module "node/select/optional-builtins.js" {
    interface OptionalBuiltins {
        "node:timers": typeof import("node:timers");
        "timers": typeof import("timers");
    }
}
