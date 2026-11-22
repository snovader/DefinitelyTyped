export type BinaryToTextEncoding = "base64" | "base64url" | "hex";
export type BufferEncoding = import("node:buffer").TranscodeEncoding | BinaryToTextEncoding;

export const atob: typeof globalThis extends { atob: infer F } ? F : (data: string) => string;
export const btoa: typeof globalThis extends { btoa: infer F } ? F : (data: string) => string;
