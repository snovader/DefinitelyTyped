import type { Process } from "node/select/process-context.js";

declare var process: Process;
declare namespace process {
    type ProcessEventMap = import("node/select/process-context.js").ProcessEventMap;
}
export = process;
