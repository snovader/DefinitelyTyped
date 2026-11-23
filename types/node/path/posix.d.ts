/// <reference path="../path.d.ts" />
declare module "node:path/posix" {
    import path = require("node:path");
    export = path.posix;
}
declare module "path/posix" {
    import path = require("path");
    export = path.posix;
}

declare module "node/select/optional-builtins.js" {
    interface OptionalBuiltins {
        "node:path/posix": typeof import("node:path/posix");
        "path/posix": typeof import("path/posix");
    }
}
