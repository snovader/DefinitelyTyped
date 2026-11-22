/// <reference path="./fs.d.ts" />
/// <reference path="./child_process.d.ts" />
/// <reference path="./tty.d.ts" />
/// <reference path="./worker_threads.d.ts" />
declare module "node:process" {
    import process = require("node/select/process-value.js");
    export = process;
}
declare module "process" {
    import process = require("node:process");
    export = process;
}
