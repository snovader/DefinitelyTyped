import proc from "node:process";
import bare = require("process");

declare const checkedPid: number & { readonly checked: unique symbol };
declare global {
    namespace NodeJS {
        interface Control { applicationControl: true }
        interface ReadonlyArray<T> { applicationGroup: T }
        interface ReadonlySet<T> { applicationFlag: T }
        interface ProcessProperties { applicationProperty: string }
        interface RequiredProcessProperties { applicationProperty: string }
        interface Process {
            kill(pid: typeof checkedPid): "checked";
            cwd(): "/fixture";
            readonly pid: number;
        }
        interface ProcessVersions { readonly fixture: "augmented" }
    }
}

export const checked = bare.kill(checkedPid);
export const ordinary = proc.kill(1, "SIGINT");
export const path = process.cwd();
export const importedPath = proc.cwd();
export const kill = proc.kill;
export const cwd = bare.cwd;
export const version = proc.versions.fixture;
export const control = proc.channel?.applicationControl;
export const flag = proc.allowedNodeEnvironmentFlags.applicationFlag;
export const setgroups = proc.setgroups;
