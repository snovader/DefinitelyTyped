/// <reference path="../path.d.ts" />
declare module "node:path/win32" {
    import path = require("node:path");
    export = path.win32;
}
declare module "path/win32" {
    import path = require("path");
    export = path.win32;
}

declare module "node/select/optional-builtins.js" {
    interface OptionalBuiltins {
        "node:path/win32": typeof import("node:path/win32");
        "path/win32": typeof import("path/win32");
    }
}
