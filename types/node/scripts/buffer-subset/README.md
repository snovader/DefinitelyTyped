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

## Shared declarations and global overloads

Both selectors load the same public module in `select/register.d.ts`, the same ordinary `Buffer` and `BufferConstructor` interfaces in `select/buffer-core.d.ts`, and the same compiler-specific overloads in `select/buffer-version.d.ts` or its TypeScript 5.6 counterpart. They also load the same `stream/web.d.ts`. These are the files to edit when changing the Buffer API.

The subset exports the module-local interfaces. Full Node loads an additional pair of generated files: `legacy/buffer-methods.d.ts` and the applicable `legacy/buffer-version*.d.ts`. They declare members on the open global interfaces in the same scope as upstream. The public module then exports the global Buffer, so consumer augmentations reach `Buffer`, `globalThis.Buffer`, and both module spellings. The global instance interface inherits from the shared Buffer. Its single-signature methods can inherit their documentation; overloads keep their individual documentation and deprecation tags.

**Sharing has a cost here.** Every Buffer method has one maintained definition, but its signature appears again in the generated global declarations. That places it in the same merge as downstream global overloads. Simple inheritance allowed an overlapping downstream method to hide the built-in overloads. Sending the built-ins through an external module augmentation instead changed which overload won when Node was referenced first. The constructor's own declaration group also preserves the spelling of types in an extracted generic `Buffer.from`. [TypeScript declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)

## Reproduce

Run from `types/node` with the checkout's TypeScript and `undici-types` dependencies installed.

```sh
node scripts/buffer-subset/generate.mjs --check
node scripts/buffer-subset/verify.mjs --overloads-only
node scripts/buffer-subset/verify.mjs
```

Run the generator without `--check` after changing the shared declarations. The verifier stages the candidate and upstream commit `9b0ad8df8337133ee935159e5edf8947b1064085` as separate installations. Pass `--tsc /absolute/path/to/tsc` to test a different compiler.

The overload fixtures compare the complete emitted consumer declaration byte for byte. They cover `readUInt8`, `Buffer.from`, a construct signature, and extracted method references. The verifier runs five source orders, including two competing consumer augmentations, under five full/global selector combinations. The original failing case now emits `0 | 1` for the read and preserves the `decoded` property on the result of `Buffer.from`. Reversing the source order produces the broader upstream types.

The regular suite runs 85 consumer builds per compiler with ES, DOM and Web Worker libraries, NodeNext and Bundler resolution, and implicit and explicit type roots. It compares diagnostics and declaration emit, checks that the full selector includes the subset's entire file list, and checks both orders of the combined selectors. The checkout's TypeScript also compares unqualified global names, public module exports, and the resolved Buffer constructor and method signatures with their documentation and tags.

On TypeScript 6.0.3, Buffer-only loads 12 Node declaration files. Full Node loads all 12 among its 96 files. Buffer-only adds no unqualified globals. The unchanged TypeScript 5.7.3 baseline reports TS2430 in the full DOM and Web Worker configurations; the verifier requires the same diagnostics.

TypeScript 5.6.3, 5.7.3, 5.9.3, 6.0.3 and 7.1.0-dev.20261121.1 passed both suites. The DefinitelyTyped Node DOM, non-DOM and Web Worker test projects also passed on TypeScript 5.9.3.
