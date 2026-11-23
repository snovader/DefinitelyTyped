import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import parser from "typescript";

// Direct public dependencies, including types referenced by the isolated host interfaces.
// Assert their transitive closure independently of the package's reference directives.
const dependencies = {
    assert: ["assert/strict"],
    "assert/strict": ["assert"],
    async_hooks: [],
    buffer: ["stream/web"],
    child_process: ["dgram", "net", "stream"],
    cluster: ["child_process", "events"],
    console: ["util"],
    constants: ["crypto", "fs", "os"],
    crypto: ["buffer", "stream", "tls"],
    dgram: ["buffer", "dns", "events", "net"],
    diagnostics_channel: ["async_hooks"],
    dns: ["dns/promises"],
    "dns/promises": ["dns"],
    domain: ["events"],
    events: ["async_hooks"],
    ffi: ["buffer"],
    fs: ["fs/promises", "stream"],
    "fs/promises": ["fs", "readline"],
    http: ["net", "stream", "url", "worker_threads"],
    http2: ["fs", "http", "tls"],
    https: ["http", "tls"],
    inspector: ["events"],
    "inspector/promises": ["events", "inspector"],
    module: ["url"],
    net: ["dns", "stream"],
    os: ["buffer"],
    path: [],
    "path/posix": ["path"],
    "path/win32": ["path"],
    perf_hooks: ["events"],
    process: ["child_process", "fs", "tty", "worker_threads"],
    punycode: [],
    querystring: [],
    quic: ["crypto", "fs/promises", "net", "stream/iter", "tls"],
    readline: ["buffer", "events", "readline/promises"],
    "readline/promises": ["readline"],
    repl: ["readline", "util", "vm"],
    sea: ["buffer"],
    sqlite: ["fs"],
    stream: ["buffer", "events", "stream/iter", "stream/promises"],
    "stream/consumers": ["buffer", "events", "stream/web"],
    "stream/iter": ["stream"],
    "stream/promises": ["stream", "stream/web"],
    "stream/web": [],
    string_decoder: ["buffer"],
    test: ["assert", "stream", "test/reporters", "url"],
    "test/reporters": ["stream", "test"],
    timers: ["events", "timers/promises"],
    "timers/promises": ["timers"],
    tls: ["buffer", "crypto", "net"],
    trace_events: [],
    tty: ["net"],
    url: ["buffer", "http", "querystring"],
    util: ["util/types"],
    "util/types": ["crypto"],
    v8: ["stream"],
    vfs: ["fs", "fs/promises"],
    vm: ["buffer"],
    wasi: [],
    worker_threads: ["fs/promises", "net", "perf_hooks", "v8", "vm"],
    zlib: ["buffer", "stream"],
    "zlib/iter": ["stream/iter"],
};

function closure(name, result = new Set()) {
    if (!result.has(name)) {
        result.add(name);
        for (const child of dependencies[name]) closure(child, result);
    }
    return result;
}

export function checkModules({ baseline, candidate, compile, nodeFiles, surface, moduleExports, ts, version }) {
    const names = Object.keys(dependencies).sort();
    const declarations = new Map();
    function registered(files, isolated = false) {
        const modules = new Set();
        for (const file of files) {
            if (!declarations.has(file)) {
                const source = parser.createSourceFile(file, readFileSync(file, "utf8"), parser.ScriptTarget.Latest);
                const modules = parser.isExternalModule(source) ? [] : source.statements
                    .filter(s => parser.isModuleDeclaration(s) && parser.isStringLiteral(s.name))
                    .map(s => s.name.text).filter(s => !s.startsWith("node/select/"));
                const globalAugmentation = node => Boolean(node.flags & parser.NodeFlags.GlobalAugmentation)
                    || parser.forEachChild(node, globalAugmentation);
                declarations.set(file, { modules, augmentsGlobals: globalAugmentation(source) });
            }
            const declaration = declarations.get(file);
            if (isolated) assert.ok(!declaration.augmentsGlobals, file + " augments the global scope");
            for (const name of declaration.modules) modules.add(name);
        }
        return modules;
    }
    const upstream = compile(baseline, ["node"], "", "nodenext", false, false, "ESNext", { files: ["load-node-first"] });
    assert.equal(upstream.diagnostics, "");
    const upstreamModules = registered(nodeFiles(baseline, upstream.files).map(f => join(baseline, "node_modules/@types/node", f)));
    assert.deepEqual(names, [...upstreamModules].filter(n => n.startsWith("node:")).map(n => n.slice(5)).sort());
    const original = readFileSync(join(baseline, "node_modules/@types/node/process.d.ts"), "utf8");
    const builtinKeys = new Set([...original.matchAll(/^        "([^"]+)": typeof import\(/gm)].map(m => m[1]));
    const fixture = join(candidate, "fixtures/selector.ts");
    const selections = ts ? [["ES2020", "", false], ["ESNext", "DOM", true], ["ESNext", "WebWorker", false]]
        : [["ES2020", "", false]];
    function isolatedModules(types, files) {
        const declarations = nodeFiles(candidate, files);
        if (types.length === 1 && types[0] === "node/path") assert.deepEqual(declarations, ["path.d.ts"]);
        if (types.length === 1 && types[0] === "node/events") {
            assert.ok(!declarations.some(path => /byte-types|stream-web-bindings/.test(path)), "events loads byte or stream types");
        }
        return registered(declarations.map(f => join(candidate, "node_modules/@types/node", f)), true);
    }
    function check(types, lib, host, roots, expected, expectedGlobals, upstreamExports) {
        if (!ts) {
            const target = compile(candidate, types, host, "nodenext", roots, false, lib, { files: ["selector"] });
            assert.equal(target.diagnostics, "", types.join("+"));
            assert.deepEqual(isolatedModules(types, target.files), expected, types.join("+") + " native module graph");
            return;
        }
        const program = ts.createProgram([fixture], {
            module: ts.ModuleKind.NodeNext, target: ts.ScriptTarget.ESNext, strict: true, types,
            lib: [lib, ...(host ? [host] : [])].map(n => "lib." + n.toLowerCase() + ".d.ts"),
            configFilePath: join(candidate, "tsconfig.json"), ...(roots ? { typeRoots: [join(candidate, "node_modules/@types")] } : {}),
        });
        const diagnostics = ts.getPreEmitDiagnostics(program);
        assert.equal(diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, "\n")).join("\n"), "", types.join("+") + " " + host);
        isolatedModules(types, program.getSourceFiles().map(file => file.fileName));
        const checker = program.getTypeChecker();
        const globals = new Set(checker.getSymbolsInScope(program.getSourceFile(fixture),
            ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace).map(s => s.name).filter(n => !n.startsWith('"') && n !== "probe"));
        assert.deepEqual(new Set(checker.getAmbientModules().map(s => JSON.parse(s.name)).filter(n => !n.startsWith("node/select/"))), expected);
        if (expectedGlobals) {
            assert.deepEqual(globals, expectedGlobals, types.join("+") + " globals");
            for (const module of checker.getAmbientModules()) {
                if (expected.has(JSON.parse(module.name))) assert.deepEqual(moduleExports(ts, checker, module),
                    upstreamExports.get(module.name), types.join("+") + " exports of " + module.name);
            }
        }
        return globals;
    }
    for (const [lib, host, roots] of selections) {
        writeFileSync(fixture, "export {};\n");
        const globals = ts && check([], lib, host, roots, new Set());
        const upstreamExports = ts && surface(ts, baseline, ["node"], [lib, host].filter(Boolean).map(name => name.toLowerCase())).modules;
        for (const name of names) {
            const scoped = closure(name);
            const expected = new Set([...upstreamModules].filter(n => scoped.has(n.replace(/^node:/, ""))));
            writeFileSync(fixture, 'import * as probe from "node:' + name + '";\nexport { probe };\n'
                + '// @ts-expect-error Node globals require an environment selector.\nprocess.cwd();\n');
            check(["node/" + name], lib, host, roots, expected, globals, upstreamExports);
            if (!host) {
                const both = new Set([...scoped, ...closure("process")]);
                const combined = new Set([...upstreamModules].filter(n => both.has(n.replace(/^node:/, ""))));
                const calls = [...combined].filter(n => builtinKeys.has(n)).map(n =>
                    'probe.getBuiltinModule("' + n + '") satisfies typeof import("' + n + '");');
                writeFileSync(fixture, 'import probe from "node:process";\n' + calls.join("\n") + "\n");
                check(["node/process", "node/" + name], lib, host, roots, combined, globals, upstreamExports);
            }
        }
    }
    for (const files of [["module-augmentations"], ["load-node-first", "module-augmentations"]]) {
        for (const mode of ["nodenext", "nodenext-esm"]) {
            const test = (dir, types) => compile(dir, types, "", mode, false, false, "ESNext", { files, emit: "module-augmentations" });
            const original = test(baseline, ["node"]);
            assert.equal(original.diagnostics, "");
            for (const types of [["node"], ["node/http", "node"], ["node", "node/timers"]]) {
                const result = test(candidate, types);
                assert.equal(result.diagnostics, "");
                assert.equal(result.declaration, original.declaration, types.join("+") + " declaration emit");
            }
        }
    }
    console.log(version + " verified " + names.length + " built-in selectors, their dependencies and process registry combinations.");
}

export function checkPublicEmit({ baseline, candidate, compile, surface, ts }) {
    const names = Object.keys(dependencies).sort();
    // Inspect what consumers actually publish, including inferred return and instance types.
    // Separating modules keeps an upstream private-name diagnostic from suppressing the rest.
    const { values } = surface(ts ?? parser, baseline, ["node"], ["esnext"], "public");
    const probes = [];
    let count = 0;
    for (const name of names) {
        const members = values.get(JSON.stringify("node:" + name));
        const files = new Map();
        for (const key of members) {
            // Test unnameable upstream types separately so the other values still emit.
            const privateType = (name === "test/reporters" && ["spec", "lcov"].includes(key))
                || (name === "process" && key === "getBuiltinModule");
            const id = "publish-" + name.replaceAll("/", "-") + (privateType ? "-" + key : "");
            if (!files.has(id)) files.set(id, ['import api = require("node:' + name + '");',
                "declare function result<F>(fn: F): F extends (...args: never[]) => infer R ? R : F extends abstract new(...args: never[]) => infer I ? I : F;"]);
            const source = files.get(id);
            const value = "member" + source.length;
            source.push("export const " + value + " = api[" + JSON.stringify(key) + "];",
                "export const inferred" + source.length + " = result(" + value + ");");
            count++;
        }
        assert.ok(files.size, name + " must exercise a public value");
        for (const [id, source] of files) {
            probes.push(id);
            for (const dir of [baseline, candidate]) writeFileSync(join(dir, "fixtures", id + ".ts"), source.join("\n") + "\n");
        }
    }
    for (const mode of ["nodenext", "nodenext-esm"]) {
        const publish = dir => compile(dir, ["node"], "", mode, false, false, "ESNext", { files: probes });
        const original = publish(baseline);
        const current = publish(candidate);
        assert.equal(current.diagnostics, original.diagnostics, "full public module diagnostics");
        for (const id of probes) {
            const output = dir => {
                const path = join(dir, "out", id + ".d.ts");
                return existsSync(path) ? readFileSync(path, "utf8") : undefined;
            };
            const before = output(baseline)?.split("\n") ?? [];
            const after = output(candidate)?.split("\n") ?? [];
            const lines = before.length >= after.length ? before : after;
            const line = lines.findIndex((_, i) => before[i] !== after[i]);
            if (line >= 0) assert.fail(id + " full consumer emit (" + mode + ") at line " + (line + 1)
                + "\noriginal: " + before[line]?.slice(0, 400) + "\ncurrent:  " + after[line]?.slice(0, 400));
        }
    }
    console.log("Compared full Node declaration emit and diagnostics for " + count + " public values in CommonJS and ESM.");
}
