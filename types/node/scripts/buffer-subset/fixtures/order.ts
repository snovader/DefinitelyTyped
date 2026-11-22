import { Buffer as Imported } from "node:buffer";
import { Buffer as BareBuffer } from "buffer";

declare const byteOffset: number & { readonly checked: unique symbol };
declare const hex: string & { readonly hex: unique symbol };
declare global {
    interface Buffer {
        readUInt8(offset: typeof byteOffset): 0 | 1;
    }
    interface BufferConstructor {
        new(value: typeof hex): Buffer & { readonly constructed: true };
        from(value: typeof hex): Buffer & { readonly decoded: true };
    }
}

export const flag = Imported.alloc(4).readUInt8(byteOffset);
export const decoded = Buffer.from(hex);
export const from = Imported.from;
export const constructed = new BareBuffer(hex);
export const read = Buffer.alloc(1).readUInt8;
