# Selecting Buffer declarations

This prototype targets the Node 26 declarations. With this checkout installed as `@types/node`, a consumer can use the following configuration.

```json
{
  "compilerOptions": {
    "types": ["node/buffer"]
  }
}
```

Import `Buffer` from `node:buffer` or `buffer`. The real `Blob.stream()` signature also brings in `node:stream/web` and `stream/web`. With ES2020 or later, this selector adds no unqualified globals. Add `node/globals` to opt into the Node global environment. That selector currently references the full package, including the built-ins exposed by `process.getBuiltinModule()` and the Fetch dependencies. Other module selectors are outside this prototype.

## How the declarations are shared

Both selectors reach the same `select/register.d.ts` for the public Buffer module, `select/buffer-core.d.ts` for common methods, and `select/buffer-version.d.ts` or its TypeScript 5.6 counterpart for compiler-specific overloads. They load the same `stream/web.d.ts`. The generator only handles the small module-local dependencies extracted from existing Node and Web globals.

In Buffer-only mode, `select/buffer-bindings.d.ts` owns the module-local Buffer interfaces. Full Node additionally loads `buffer-globals.d.ts` and `select/global-buffer-bindings.d.ts`. The latter registers an ambient module under the same internal bindings specifier, so the shared declarations use the global interfaces and original Node and Web type names. The shared method declarations augment a star re-export of the two Buffer interfaces. This lets new methods added by a consumer reach the global Buffer, the imported Buffer, and the bare module alias.

## Compatibility result

In the regular selector fixtures, full Node matches upstream diagnostics and emitted consumer declarations. The fixtures exercise instance and static extensions, global assignment, a function overload, inferred encodings, streams and typed arrays. The full and subset file lists overlap on every implementation file. On TypeScript 6.0.3, Buffer-only loads 14 Node declaration files and full Node loads all 14 among its 96 files.

**Overlapping consumer overloads still expose a compatibility difference.** The `order.ts` fixture adds a narrower `Buffer.readUInt8` overload for a branded numeric offset and a narrower `BufferConstructor.from` overload for a branded string. When the consumer is loaded first, the emitted declarations match upstream. When `load-node-first.ts` references Node before the consumer augmentation, upstream infers `0 | 1` for the read and a Buffer with a `decoded` property for the conversion. This prototype infers `number` and an ordinary Buffer. The difference affects inference in application code as well as its emitted public types.

The TypeScript 6 checker processes global augmentations before external-module augmentations. In upstream, the built-in and consumer overloads participate in the global pass. Here the built-ins enter through a module augmentation, so the relative order can change. This limits exact compatibility for the shared-declaration design in this checkout. [TypeScript 6.0.3 checker](https://github.com/microsoft/TypeScript/blob/v6.0.3/src/compiler/checker.ts#L51001-L51055)

## Reproduce

Run from `types/node`, with the checkout's TypeScript and `undici-types` dependencies installed.

```sh
node scripts/buffer-subset/generate.mjs --check
node scripts/buffer-subset/verify.mjs
node scripts/buffer-subset/verify.mjs --overloads-only
```

The verifier stages isolated copies of upstream commit `9b0ad8df8337133ee935159e5edf8947b1064085` and the working tree. Pass `--tsc /absolute/path/to/tsc` to select a compiler. For each compiler, the regular suite runs 85 consumer builds using ES, DOM and Web Worker libraries, NodeNext and Bundler resolution, and implicit and explicit type roots. It compares upstream diagnostics and emitted declarations byte for byte for the full selectors, checks the subset file list against the full selector, and verifies that combining selectors adds no second implementation. With the checkout's TypeScript it also compares the subset's global names against an empty selection and its built-in module export names against upstream.

On TypeScript 5.6.3, 5.7.3, 5.9.3, 6.0.3 and 7.1.0-dev.20261121.1 the regular fixtures passed, including matching upstream TS2430 diagnostics in the TypeScript 5.7.3 DOM and Web Worker configurations. All five compilers exhibited the overload-order difference. The upstream DOM, non-DOM and Web Worker test projects also compiled on TypeScript 5.9.3.

The last four builds compare the two overload-order cases against upstream and exit nonzero on a difference. Both the full verifier and `--overloads-only` enforce this check.
