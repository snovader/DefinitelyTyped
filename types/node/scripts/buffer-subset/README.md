# Maintaining selectable Node declarations

The [Node 26 package guide](../../README.md) describes the supported selectors, dependency examples, and globals.

## Maintaining the declarations

Edit each built-in's public declarations in its module file. For modules with a two-reference selector, the public declarations live in the referenced file under `internal/`. Keep its public dependencies reachable through reference directives. Ordinary type imports under `select/` supply the module-local environment. Global entry points bind these imports to the original open interfaces and values. The compiler-version directories override declarations where TypeScript versions differ and otherwise fall through to the common files.

Full Node and standalone selectors load the same HTTP and timer declarations from `internal/`. Standalone entry points also load wildcard ambient modules that supply their local HTTP or timer types. The shared declarations import exact names such as `node/select/env/http`. When globals are enabled, an exact ambient declaration takes precedence over the wildcard. Full Node loads the shared declarations directly, so it can use stock Undici and the global timer overloads without reading the standalone fallbacks.

Buffer's public module registration, core interfaces and compiler-specific overloads are shared across selections. The generator also places the Buffer methods directly on the open global interfaces. This preserves the precedence of application overloads and the spelling of inferred declarations.

Process properties have one implementation in `select/process-properties.d.ts`. Full Node and the standalone selector share its public module registration. Its 58 method signatures originate in `legacy/process.d.ts`, which installs them on `NodeJS.Process`. The generator projects those methods into the standalone scope. Full Node loads only the global method group. A program explicitly selecting both environments can load both groups and uses the globally augmentable API.

When TypeScript serializes an inferred anonymous class, it must also name any computed methods. The global EventEmitter method group uses an export-assigned class to name Node's original rejection symbol. Duplex inherits a projection of Readable's disposal member with the global symbol, so application overloads on Duplex still take precedence. The emit fixtures cover the cluster Worker constructor and the private classes underlying the test reporters.

## Verification

Run these commands from `types/node` with the checkout's TypeScript and Undici dependencies installed.

```sh
node scripts/buffer-subset/generate.mjs --check
node scripts/buffer-subset/verify.mjs
```

Run the generator without `--check` after editing source declarations that supply projections. The verifier stages stock Undici alongside the candidate and upstream commit `9b0ad8df8337133ee935159e5edf8947b1064085` in separate temporary installations. Use `--tsc /absolute/path/to/tsc` to select a compiler. Focused runs accept `--modules-only`, `--emit-only`, `--globals-only`, `--fs-process-only`, `--zlib-only`, and `--overloads-only`.

The selector suite checks each built-in's transitive public module set and its combinations with process. On compilers with the JavaScript checker API it also compares the unqualified names with an empty selection, and the names and kinds of module exports with upstream, under ES, DOM and Web Worker libraries. The verifier exercises emitting and consuming declarations, CommonJS and ESM, NodeNext and Bundler resolution, alternate type roots, and competing augmentations in different source orders. Full-Node comparisons use the matching compiler's upstream diagnostics and emit. This includes pre-existing TypeScript 5.7 DOM and Web Worker diagnostics.
