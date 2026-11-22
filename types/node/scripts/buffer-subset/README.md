# Selecting Node declarations

This prototype targets the Node 26 declarations. With this checkout installed as `@types/node`, a consumer can use the following configuration.

```json
{
  "compilerOptions": {
    "types": ["node/zlib"]
  }
}
```

Import compression functions from `node:zlib` or `zlib`. This selector already includes `node:buffer`. A consumer that only needs Buffer can use `"types": ["node/buffer"]`. Its `Blob.stream()` signature also brings in `node:stream/web`. With ES2020 or later, both selectors leave unqualified global names alone. Add `node/globals` to opt into the Node global environment. That selector currently references the full package, including the built-ins exposed by `process.getBuiltinModule()` and the Fetch dependencies. Buffer and zlib are the independently verified subset entry points.

## What zlib loads

```ts
import { Buffer } from "node:buffer";
import { createGunzip, createGzip, gzipSync } from "node:zlib";

const bytes: Buffer = gzipSync("payload");
const compressor = createGzip();
const decompressed = compressor.pipe(createGunzip());
compressor.end("payload");
```

The real `zlib.d.ts` uses the existing Buffer selector and `Transform` from `node:stream`. Stream brings in events, async hooks, stream iterators, stream promises and Web Streams. These eight built-ins are available under both their bare and `node:` names. The file graph excludes HTTP, filesystem declarations, `stream/consumers`, `zlib/iter`, the full Node entry point and `undici-types`.

On TypeScript 6.0.3, zlib loads 23 Node declaration files, including all 12 loaded by Buffer. Adding Buffer explicitly in either order produces the same file set. Full Node loads all 23 among its 105 files. The complete programs are compared as well, so extra compiler libraries or external packages would fail the test.

The stream and events declarations import their environment types through `select/zlib-bindings.d.ts`. The subset uses module-local event, stream and iterator interfaces. ES2020 projects get local disposal-symbol types. With full Node, the bindings resolve to the original global types. The generated `legacy/events-globals.d.ts` and `legacy/stream-globals.d.ts` put the methods back on the open `NodeJS` interfaces, where consumer overloads can merge with them. The stream dependency and the standalone `node/async_hooks` entry share the same async-hooks declarations. Each supplies the appropriate disposal interface for `RunScope`; direct async-hooks selection therefore still honors a consumer's global `Disposable` augmentation without loading streams. Older compiler routes include forwarding files for types named in a library's emitted declarations.

## Shared declarations and global overloads

Buffer-only, zlib-only and full Node load the same public Buffer module in `select/register.d.ts`, the same ordinary `Buffer` and `BufferConstructor` interfaces in `select/buffer-core.d.ts`, and the same compiler-specific overloads in `select/buffer-version.d.ts` or its TypeScript 5.6 counterpart. They also load the same `stream/web.d.ts`. These are the files to edit when changing the Buffer API.

The subset exports the module-local interfaces. Full Node loads an additional pair of generated files: `legacy/buffer-methods.d.ts` and the applicable `legacy/buffer-version*.d.ts`. They declare members on the open global interfaces in the same scope as upstream. The public module then exports the global Buffer, so consumer augmentations reach `Buffer`, `globalThis.Buffer`, and both module spellings. The global instance interface inherits from the shared Buffer. Its single-signature methods can inherit their documentation; overloads keep their individual documentation and deprecation tags.

**Sharing has a cost here.** Every Buffer method has one maintained definition, but its signature appears again in the generated global declarations. That places it in the same merge as downstream global overloads. Simple inheritance allowed an overlapping downstream method to hide the built-in overloads. Sending the built-ins through an external module augmentation instead changed which overload won when Node was referenced first. The constructor's own declaration group also preserves the spelling of types in an extracted generic `Buffer.from`. [TypeScript declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)

## Reproduce

Run from `types/node` with the checkout's TypeScript and `undici-types` dependencies installed.

```sh
node scripts/buffer-subset/generate.mjs --check
node scripts/buffer-subset/verify.mjs --zlib-only
node scripts/buffer-subset/verify.mjs --overloads-only
node scripts/buffer-subset/verify.mjs
```

Run the generator without `--check` after changing the shared declarations. The verifier stages the candidate and upstream commit `9b0ad8df8337133ee935159e5edf8947b1064085` as separate installations. Pass `--tsc /absolute/path/to/tsc` to test a different compiler.

The overload fixtures compare the complete consumer declaration byte for byte. They cover Buffer instance methods, static factories, construction, extracted method references and an overlapping `NodeJS.EventEmitter` overload. Five source orders exercise seven full/global selector combinations.

The selector suite uses ES, DOM and Web Worker libraries, NodeNext and Bundler resolution, and implicit and explicit type roots. It checks compression and streaming calls, typed event emission, sync and async disposal, and the absence of Node globals. A downstream consumer compiles the emitted zlib declarations, including inferred iterator, stream and abort-signal types. NodeNext is exercised with CommonJS and ESM packages.

On compilers with the JavaScript checker API, the verifier compares all unqualified global names against an empty selection and built-in export names against upstream. It also checks that the compiler resolves the type of `gzipSync()` and an explicitly imported `Buffer` to the same symbol. Full Node and explicit globals are compared with upstream diagnostics and declaration emit. The TypeScript 5.7.3 baseline reports TS2430 in the full DOM and Web Worker configurations; the verifier requires matching diagnostics.

The zlib prototype passed on TypeScript 5.6.3, 5.7.3, 5.9.3, 6.0.3 and 7.1.0-dev.20261121.1. The upstream Node DOM, non-DOM and Web Worker test projects passed on TypeScript 5.9.3.
