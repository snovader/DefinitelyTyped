# Selecting Node 26 declarations

Select a built-in by adding its name under `node/` to `compilerOptions.types`. Use the normal Node module specifier in application code. Nested built-ins such as `node/fs/promises` and prefix-only built-ins such as `node/test` work the same way.

```json
{
  "compilerOptions": {
    "lib": ["ES2020"],
    "types": ["node/buffer", "node/zlib"]
  }
}
```

```ts
import { Buffer } from "node:buffer";
import { gzipSync } from "node:zlib";

const bytes: Buffer = gzipSync("payload");
```

Each of the 62 public built-ins loads its transitive declaration dependencies. For example, `node/path` loads only the path declarations. `node/events` also loads async hooks. Zlib uses Buffer and streams, so adding Buffer explicitly gives the same file set in either order. Selecting a module makes its bare spelling available when Node provides one.

The standalone declarations target ES2020 or later and use the ES libraries selected by the application. Module-only selections leave the host's unqualified names alone. Add `node/globals` for globals such as `Buffer`, `process`, `require`, and `NodeJS`. Keep `"types": ["node"]` for the full Node environment. This change targets the current Node 26 package.

## Dependency examples

| Selection | What the compiler registers |
| --- | --- |
| `node/buffer` | Buffer and Web Streams, needed by `Blob.stream()` |
| `node/zlib` | Eight built-ins, including Buffer, streams, events and async hooks |
| `node/fs` | Eleven built-ins, including filesystem promises, streams and readline |
| `node/process` | Twenty-two built-ins, including fs, child processes, TTYs and workers |
| `node/globals` | The global environment and 33 built-ins used by its declarations |
| `node` | The global environment and all 62 built-ins |

The literal overload of `process.getBuiltinModule()` knows about the modules in the selected graph. With globals alone, `process.getBuiltinModule("node:zlib")` returns `object | undefined`. Adding `node/zlib` gives both zlib spellings their precise types. Full Node retains the upstream built-in registry and fallback overload.

The isolated HTTP and Fetch APIs work with the stock `undici-types` dependency. Some Undici entries explicitly load full Node. The generator projects their reachable declarations into ordinary modules, using the installed Undici source and retaining its license. The full entry uses Undici's original types. A globals-only library can therefore emit `import("node/select/headers").Headers`, or its `.js` spelling under ESM. Full Node retains the upstream Undici spelling.

In the DefinitelyTyped checkout, `types/node/scripts/buffer-subset/README.md` explains how to regenerate the declarations and run the compatibility checks.
