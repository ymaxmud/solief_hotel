// `server-only` is resolved by the Next.js compiler, not by npm, so it does not
// exist in node_modules for Vitest to import. Aliasing it to this empty module
// lets unit tests import server modules directly; the real build-time guard is
// unaffected.
export {};
