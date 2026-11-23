import { headers } from "./globals-emitted.js";

declare module "undici-types/fetch.js" {
    interface Headers { applicationHeader(): "present" }
}
export const marker: "present" = headers.applicationHeader();
