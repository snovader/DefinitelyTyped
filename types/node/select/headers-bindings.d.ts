import type { Headers as NodeHeaders } from "./headers.js";

export type Headers = typeof globalThis extends { Headers: { prototype: infer T } } ? T : NodeHeaders;
