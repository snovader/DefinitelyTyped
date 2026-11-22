import type { Process } from "./process-types.js";

declare var process: Process;
declare namespace process {
    type ProcessEventMap = import("./process-types.js").ProcessEventMap;
}
export = process;
