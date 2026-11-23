/// <reference path="./crypto.d.ts" />
/// <reference path="./fs.d.ts" />
/// <reference path="./os.d.ts" />
declare module "node:constants" {
    const constants:
        & typeof import("node:os").constants.dlopen
        & typeof import("node:os").constants.errno
        & typeof import("node:os").constants.priority
        & typeof import("node:os").constants.signals
        & typeof import("node:fs").constants
        & typeof import("node:crypto").constants;
    export = constants;
}
declare module "constants" {
    import constants = require("node:constants");
    export = constants;
}

declare module "node/select/optional-builtins.js" {
    interface OptionalBuiltins {
        "node:constants": typeof import("node:constants");
        "constants": typeof import("constants");
    }
}
