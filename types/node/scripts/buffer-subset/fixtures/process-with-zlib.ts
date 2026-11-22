import proc from "node:process";
import { Buffer } from "node:buffer";
const compressed: Buffer = proc.getBuiltinModule("node:zlib").gzipSync("ok");
export { compressed };
