import { environment, memory, moduleOfProcess, runtime } from "./process-emitted.js";
export const home: string | undefined = environment.HOME;
export const used: number = memory.heapUsed;
export const name = moduleOfProcess?.filename;
export const contents = runtime.getBuiltinModule("fs").readFileSync("file");
