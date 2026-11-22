/// <reference path="./select/async-hooks-core.d.ts" />

declare module "node:async_hooks" {
    interface RunScope extends Disposable {}
}
