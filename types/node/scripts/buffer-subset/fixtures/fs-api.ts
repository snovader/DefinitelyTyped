import { openAsBlob, promises, readFile, readFileSync, statSync, type PathLike } from "node:fs";
import { open } from "fs/promises";
import { readFileSync as bareRead } from "fs";
import type { Buffer } from "node:buffer";

export const bytes = readFileSync("file");
export const sameBuffer: Buffer = bytes;
export const text: string = bareRead("file", "utf8");
export const bigSize: bigint = statSync("file", { bigint: true }).size;
export const handle = open("file");
export const sameOpen: typeof open = promises.open;
export const lines = handle.then(file => file.readLines());
export const blob = openAsBlob("file");
export const read = readFile;
export const path = (value: PathLike) => value;
export const callback = (cb: Parameters<typeof readFile>[1]) => cb;

declare module "node:fs" {
    interface Stats { marker(): 17 }
}
export const marker: 17 = statSync("file").marker();
