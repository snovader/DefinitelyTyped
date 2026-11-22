declare module "node:buffer" {
    export * from "node/select/buffer-api.js";
}
declare module "buffer" {
    export * from "node:buffer";
}
declare module "node:stream/web" {
    export * from "node/select/stream-web.js";
}
declare module "stream/web" {
    export * from "node:stream/web";
}
