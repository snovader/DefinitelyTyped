import { augmented, headers, response, timer } from "./globals-emitted.js";
export const value: 42 = augmented;
export const contentType = headers.get("content-type");
export const text = response.then(result => result.text());
export const active = timer.hasRef();
