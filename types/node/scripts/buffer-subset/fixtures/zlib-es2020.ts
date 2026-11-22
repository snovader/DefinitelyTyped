export {};
// @ts-expect-error - Selecting zlib must not install ESNext disposal globals.
Symbol.dispose;
// @ts-expect-error - The local fallback must not add a global Disposable.
type MissingDisposable = Disposable;
