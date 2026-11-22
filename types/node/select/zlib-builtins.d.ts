import "./optional-builtins.js";

declare module "./optional-builtins.js" {
    interface OptionalBuiltins {
        "zlib": typeof import("zlib");
        "node:zlib": typeof import("node:zlib");
    }
}
