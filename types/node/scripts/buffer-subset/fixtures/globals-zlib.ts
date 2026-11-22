export const compressed = process.getBuiltinModule("node:zlib").gzipSync("hello");
export const bare = process.getBuiltinModule("zlib").gzipSync("hello");
