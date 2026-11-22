import { bytes, handle, lines, text } from "./fs-emitted.js";
import type { Buffer } from "node:buffer";
export const saved: Buffer = bytes;
export const info = handle.then(file => file.stat({ bigint: true }));
export const reader = lines.then(rl => rl.close());
export const upper = text.toUpperCase();
