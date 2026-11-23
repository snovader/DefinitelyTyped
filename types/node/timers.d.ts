declare module "node:timers" {
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
    import clearImmediate = globalThis.clearImmediate;
    import clearInterval = globalThis.clearInterval;
    import clearTimeout = globalThis.clearTimeout;
    import setImmediate = globalThis.setImmediate;
    import setInterval = globalThis.setInterval;
    import setTimeout = globalThis.setTimeout;
    export { clearImmediate, clearInterval, clearTimeout, promises, setImmediate, setInterval, setTimeout };
}
declare module "timers" {
    export * from "node:timers";
}
