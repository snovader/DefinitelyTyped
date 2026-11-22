import "./optional-builtins.js";

declare module "./optional-builtins.js" {
    interface OptionalBuiltins {
        "assert": typeof import("assert");
        "node:assert": typeof import("node:assert");
        "assert/strict": typeof import("assert/strict");
        "node:assert/strict": typeof import("node:assert/strict");
        "cluster": typeof import("cluster");
        "node:cluster": typeof import("node:cluster");
        "constants": typeof import("constants");
        "node:constants": typeof import("node:constants");
        "diagnostics_channel": typeof import("diagnostics_channel");
        "node:diagnostics_channel": typeof import("node:diagnostics_channel");
        "domain": typeof import("domain");
        "node:domain": typeof import("node:domain");
        "node:ffi": typeof import("node:ffi");
        "http2": typeof import("http2");
        "node:http2": typeof import("node:http2");
        "https": typeof import("https");
        "node:https": typeof import("node:https");
        "inspector": typeof import("inspector");
        "node:inspector": typeof import("node:inspector");
        "inspector/promises": typeof import("inspector/promises");
        "node:inspector/promises": typeof import("node:inspector/promises");
        "os": typeof import("os");
        "node:os": typeof import("node:os");
        "path": typeof import("path");
        "node:path": typeof import("node:path");
        "path/posix": typeof import("path/posix");
        "node:path/posix": typeof import("node:path/posix");
        "path/win32": typeof import("path/win32");
        "node:path/win32": typeof import("node:path/win32");
        "punycode": typeof import("punycode");
        "node:punycode": typeof import("node:punycode");
        "node:quic": typeof import("node:quic");
        "repl": typeof import("repl");
        "node:repl": typeof import("node:repl");
        "node:sea": typeof import("node:sea");
        "node:sqlite": typeof import("node:sqlite");
        "stream/consumers": typeof import("stream/consumers");
        "node:stream/consumers": typeof import("node:stream/consumers");
        "string_decoder": typeof import("string_decoder");
        "node:string_decoder": typeof import("node:string_decoder");
        "node:test": typeof import("node:test");
        "node:test/reporters": typeof import("node:test/reporters");
        "trace_events": typeof import("trace_events");
        "node:trace_events": typeof import("node:trace_events");
        "node:vfs": typeof import("node:vfs");
        "wasi": typeof import("wasi");
        "node:wasi": typeof import("node:wasi");
    }
}
