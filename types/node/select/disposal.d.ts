// Older ES libraries have no disposal keys. Keep the fallbacks local to this selector.
export const Symbol: typeof globalThis.Symbol extends { readonly dispose: symbol; readonly asyncDispose: symbol }
    ? typeof globalThis.Symbol
    : typeof globalThis.Symbol & { readonly dispose: unique symbol; readonly asyncDispose: unique symbol };
export interface Disposable {
    [Symbol.dispose](): void;
}
export interface AsyncDisposable {
    [Symbol.asyncDispose](): PromiseLike<void>;
}

export type RunScopeDisposable = typeof globalThis extends { DisposableStack: { prototype: { use(value: infer D): unknown } } }
    ? NonNullable<D>
    : Disposable;
