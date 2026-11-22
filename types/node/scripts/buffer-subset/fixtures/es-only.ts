export {};
// @ts-expect-error - Web-shaped Buffer dependencies do not install Web globals.
AbortSignal.timeout(10);
// @ts-expect-error - Using the exported Blob does not install a global Blob.
new Blob();
// @ts-expect-error - The web streams dependency does not install a global constructor.
new ReadableStream();
// @ts-expect-error - Node's Fetch declarations would load undici-types and full Node.
fetch("/");
