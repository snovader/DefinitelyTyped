declare module "node/select/*/http" {
    export { CloseEvent, MessageEvent, WebSocket } from "node/select/http-bindings.js";
}
declare module "node/select/*/headers" {
    export type { Headers } from "node/select/headers-bindings.js";
}
