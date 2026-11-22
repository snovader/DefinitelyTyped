export {};
// @ts-expect-error -- globals require node/globals or node
process.cwd();
// @ts-expect-error -- global Buffer is opt-in
Buffer.from("global");
// @ts-expect-error -- NodeJS is opt-in
type Environment = NodeJS.ProcessEnv;
// @ts-expect-error -- global require is opt-in
require("fs");
// @ts-expect-error -- unrelated built-in
import type { TestContext } from "node:test";
// @ts-expect-error -- type-only URL dependencies do not install HTTP
import type { IncomingMessage } from "node:http";
