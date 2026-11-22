export {};
// @ts-expect-error - zlib leaves the Node global environment opt-in.
Buffer.from("payload");
// @ts-expect-error - zlib leaves the process global opt-in.
process.cwd();
// @ts-expect-error - zlib leaves the NodeJS namespace opt-in.
type Environment = NodeJS.ProcessEnv;
// @ts-expect-error - HTTP is outside the zlib declaration graph.
import type { IncomingMessage } from "node:http";
// @ts-expect-error - Other zlib submodules are separate entry points.
import type * as Iter from "node:zlib/iter";
