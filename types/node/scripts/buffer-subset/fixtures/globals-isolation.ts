// @ts-expect-error -- this selector does not include the zlib module
import type { ZlibOptions } from "node:zlib";
// @ts-expect-error -- the built-in registry does not bring in the test runner
import type { TestContext } from "node:test";
// @ts-expect-error -- unselected built-ins use the string overload
process.getBuiltinModule("node:zlib")?.gzipSync;
export const fs = process.getBuiltinModule("fs").readFileSync;

const zlib = process.getBuiltinModule("node:zlib");
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const fallback: Equal<typeof zlib, object | undefined> = true;
export { fallback };
