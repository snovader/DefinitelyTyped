import proc from "process";
// @ts-expect-error -- HTTP is outside this selection
proc.getBuiltinModule("node:http")?.createServer;
// @ts-expect-error -- zlib is outside this selection
proc.getBuiltinModule("zlib")?.gzipSync;
export const fs = proc.getBuiltinModule("fs").readFileSync;
