import { type Abortable, addAbortListener } from "node:events";
import { createGzip, type ZipEntry } from "node:zlib";

export async function close(entry: ZipEntry, signal: NonNullable<Abortable["signal"]>) {
    using listener = addAbortListener(signal, () => {});
    await createGzip()[Symbol.asyncDispose]();
    entry[Symbol.dispose]();
}
