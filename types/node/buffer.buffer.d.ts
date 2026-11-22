/// <reference path="./select/buffer-version.d.ts" />

declare module "node:buffer" {
    import type { ArrayBufferView, Buffer } from "node/select/buffer-bindings.js";
    export type ImplicitArrayBuffer<T extends WithImplicitCoercion<ArrayBufferLike>> = T extends
        { valueOf(): infer V extends ArrayBufferLike } ? V : T;
    /**
     * @deprecated This is intended for internal use, and will be removed once `@types/node` no longer supports
     * TypeScript versions earlier than 5.7.
     */
    export type BufferView<T extends ArrayBufferView> = T extends ArrayBufferView<infer B> ? Buffer<B> : never;
}
