export {};

declare global {
    interface Buffer {
        readUInt8(offset: number): 7;
    }
    interface BufferConstructor {
        from(value: string): Buffer & { readonly peer: true };
    }
}
