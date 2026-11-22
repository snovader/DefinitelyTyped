/// <reference path="./async-hooks-core.d.ts" />

// Streams can be selected by consumers whose ES libraries have no global Disposable.
declare module "node:async_hooks" {
    import type { Disposable } from "node/select/zlib-bindings.js";
    interface RunScope extends Disposable {}
}
