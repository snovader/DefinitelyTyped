import { Buffer, type BufferView } from "node:buffer";

const shared: Buffer<SharedArrayBuffer> = Buffer.from(new SharedArrayBuffer(8)).subarray(0);
const unshared: Buffer<ArrayBuffer> = Buffer.alloc(8).slice(0);
const view: BufferView<DataView<SharedArrayBuffer>> = shared;
// @ts-expect-error - Shared memory is not an ordinary ArrayBuffer.
const incorrect: Buffer<ArrayBuffer> = shared;
export { unshared, view };
