import type { Float16Array as Fallback } from "node/select/byte-types.js";

export type Float16Array = typeof globalThis extends { Float16Array: { prototype: infer T } } ? T : Fallback;
