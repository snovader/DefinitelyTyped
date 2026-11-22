export {};
// @ts-expect-error - Including Buffer does not install a newer standard library.
type Float16 = Float16Array;
// @ts-expect-error - Array.findLast is also outside ES2020.
[].findLast(() => true);
