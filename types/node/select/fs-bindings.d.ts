import type { Blob as NodeBlob } from "node:buffer";
import type { URL } from "./url-types.js";

export type { URL };
export type GlobalURL = typeof globalThis extends { URL: { prototype: infer T } } ? T : URL;
export type Blob = typeof globalThis extends { Blob: { prototype: infer T } } ? T : NodeBlob;
