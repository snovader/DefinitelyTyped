declare module "node/select/fs-bindings.js" {
    export type { URL } from "node:url";
    export import GlobalURL = globalThis.URL;
    export import Blob = globalThis.Blob;
}
