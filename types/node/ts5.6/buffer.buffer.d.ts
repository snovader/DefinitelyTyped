/// <reference path="../select/ts5.6/buffer-version.d.ts" />

declare module "node:buffer" {
    import type { ArrayBufferView, Buffer } from "node/select/buffer-bindings.js";
    /**
     * @deprecated This is intended for internal use, and will be removed once `@types/node` no longer supports
     * TypeScript versions earlier than 5.7.
     */
    export type BufferView<T extends ArrayBufferView> = Buffer;
}
