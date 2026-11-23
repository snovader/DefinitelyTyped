import type { URL } from "./url-types.js";

interface NodeImportMeta extends ImportMeta {
    dirname: string;
    filename: string;
    main: boolean;
    url: string;
    resolve(specifier: string, parent?: string | URL): string;
}
export { type NodeImportMeta as ImportMeta };
