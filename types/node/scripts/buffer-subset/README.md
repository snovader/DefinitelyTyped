# Buffer-only Node declarations

This local prototype targets the current Node 26 declarations. A TypeScript consumer with this checkout's Node package installed can select Buffer with the following configuration.

```json
{
  "compilerOptions": {
    "types": ["node/buffer"]
  }
}
```

Use `import { Buffer } from "node:buffer"` or its existing `"buffer"` alias. The real `Blob.stream()` signature also makes `"node:stream/web"` and `"stream/web"` available. The Buffer entry point works with ES2020 libraries or newer and adds no standard libraries of its own. Node globals, Web globals and unrelated built-in modules are absent unless another input to the program supplies them.

Add `"node/globals"` to opt in to the existing Node global environment. This prototype delegates that selector to the full Node entry point. Global `process.getBuiltinModule()` exposes built-ins by name, and the Fetch declarations depend on `undici-types`, which explicitly references `node`. Other module selectors, including `node/zlib`, are outside this prototype.

## Source and compatibility

The shared Buffer API lives in `select/buffer-core.d.ts`. The real compiler-specific overloads live in `select/buffer-version.d.ts` and `select/ts5.6/buffer-version.d.ts`. Edit these files to change Buffer. Both the Buffer-only and full Node profiles derive from them.

The generator reconstructs the historical global and module scopes for the full Node profile. Keeping those scopes preserves declaration merging, overload order, and the public names TypeScript emits in consumers' declaration files. It also extracts ordinary module-scoped copies of the web-stream, typed-array, encoding and event declarations needed by Buffer. Keeping generated declarations in the checkout lets the package work without a consumer build step.

In Buffer-only mode, TypeScript can name `node/select/stream-web` and `node/select/byte-types` in a library's emitted declarations when it infers a stream return type. Those paths ship in the package. Full Node keeps its historical declaration emit.

The small `select/register.d.ts` registers the built-in module names through star re-exports. TypeScript gives the existing direct exports precedence when a consumer also loads full Node. The package keeps its upstream `typesVersions` configuration, including the TypeScript 5.6 and 5.7 routes.

## Reproduce

Run these commands from `types/node` with the checkout's TypeScript and `undici-types` dependencies available.

```sh
node scripts/buffer-subset/generate.mjs --check
node scripts/buffer-subset/verify.mjs
```

Omit `--check` to regenerate declarations. To verify another compiler, pass `--tsc /absolute/path/to/tsc`. The verifier stages separate baseline and candidate packages with their own copy of `undici-types`. Its default baseline is upstream commit `9b0ad8df8337133ee935159e5edf8947b1064085`.

The verifier compares every compiler input for full Node in load order and checks its contents, allowing the two legacy file relocations and their reference paths. It compares emitted consumer declarations and exercises global augmentations, both selector orders, NodeNext and Bundler resolution, explicit type roots, and ES-only, DOM and Web Worker environments with library checking enabled. Existing baseline diagnostics must match.

## Observed results

TypeScript 5.6.3, 5.7.3, 5.9.3, 6.0.3, and 7.1.0-dev.20261121.1 each matched the expected results across 85 consumer builds. TypeScript 5.7.3 reports TS2430 in the baseline DOM and Web Worker libraries with full Node. The candidate produces identical diagnostics. The Buffer-only cases compile cleanly.

On TypeScript 6.0.3, Buffer-only loads 10 Node declaration files and full Node loads 83. The compiler API found the same unqualified global names before and after enabling Buffer-only. The available built-in modules were exactly `buffer`, `node:buffer`, `stream/web`, and `node:stream/web`, with the same export names as upstream. The upstream Node DOM, non-DOM and Web Worker test projects also compiled with TypeScript 5.9.3 on both checkouts.
