import type { AbortController as NodeAbortController } from "./abortcontroller.js";

export type AbortController = typeof globalThis extends { AbortController: { prototype: infer T } } ? T : NodeAbortController;
