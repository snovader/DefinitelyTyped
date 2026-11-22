import { AsyncLocalStorage } from "node:async_hooks";

declare global {
    interface Disposable { standaloneHook(): 17 }
}
const storage = new AsyncLocalStorage<number>();
export const scope = storage.withScope(1);
export const value: 17 = scope.standaloneHook();
// @ts-expect-error - Standalone async_hooks does not load streams.
import type { Transform } from "node:stream";
