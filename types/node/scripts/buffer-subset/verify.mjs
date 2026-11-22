import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const nodeDir = resolve(here, "../..");
const require = createRequire(import.meta.url);
const { values } = parseArgs({ options: {
    baseline: { type: "string", default: "9b0ad8df8337133ee935159e5edf8947b1064085" },
    "zlib-only": { type: "boolean" },
    "overloads-only": { type: "boolean" },
    tsc: { type: "string", default: require.resolve("typescript/bin/tsc") },
} });
const compiler = resolve(values.tsc);
const run = (args, cwd) => execFileSync(compiler, args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
const version = run(["--version"], here).trim();
const oldBuffers = version.startsWith("Version 5.6.");
const tmp = realpathSync(mkdtempSync(join(tmpdir(), "dt-buffer-")));
const targets = ["baseline", "candidate"].map(name => join(tmp, name));
const dependency = dirname(require.resolve("undici-types/package.json", { paths: [nodeDir] }));
const bufferCounts = new Set();
const zlibCounts = new Set();
let count = 0;
const baselineErrors = new Set();

function packageDir(dir) { return join(dir, "node_modules/@types/node"); }

function stage() {
    const tarball = execFileSync("git", ["archive", values.baseline + ":types/node"], {
        cwd: resolve(nodeDir, "../.."), maxBuffer: 64 * 1024 * 1024,
    });
    for (const dir of targets) {
        mkdirSync(packageDir(dir), { recursive: true });
        cpSync(dependency, join(dir, "node_modules/undici-types"), { recursive: true });
        cpSync(join(here, "fixtures"), join(dir, "fixtures"), { recursive: true });
    }
    execFileSync("tar", ["-xf", "-", "-C", packageDir(targets[0])], { input: tarball });
    cpSync(nodeDir, packageDir(targets[1]), {
        recursive: true, filter: file => !/^(node_modules|v\d+)$/.test(basename(file)),
    });
}

// Check the complete global and module name sets with the locally installed compiler API.
function surface(ts, dir, types, lib) {
    const entry = join(dir, "surface.ts");
    writeFileSync(entry, "export {};\n");
    const program = ts.createProgram([entry], {
        target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.NodeNext, strict: true, types,
        typeRoots: [join(dir, "node_modules/@types")], lib: lib.map(name => "lib." + name + ".d.ts"),
    });
    const checker = program.getTypeChecker();
    const flags = ts.SymbolFlags;
    const globals = checker.getSymbolsInScope(program.getSourceFile(entry), flags.Type | flags.Value | flags.Namespace)
        .map(symbol => symbol.name).filter(name => !name.startsWith('"')).sort();
    const modules = new Map(checker.getAmbientModules().map(module => {
        const members = checker.getExportsOfModule(module).map(symbol => {
            const target = symbol.flags & flags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
            return [symbol.name, Boolean(target.flags & flags.Type), Boolean(target.flags & flags.Value)];
        }).sort(([a], [b]) => a.localeCompare(b));
        return [module.name, members];
    }));
    return { globals, modules };
}

function checkSelectorSurface(ts, lib) {
    const empty = surface(ts, targets[1], [], lib);
    const subset = surface(ts, targets[1], ["node/buffer"], lib);
    const legacy = surface(ts, targets[0], ["node"], lib);
    const full = surface(ts, targets[1], ["node"], lib);
    assert.deepEqual(full.globals, legacy.globals);
    for (const [name, members] of legacy.modules) assert.deepEqual(full.modules.get(name), members, name);
    assert.deepEqual(subset.globals, empty.globals);
    const bufferModules = ["buffer", "stream/web"];
    const zlib = surface(ts, targets[1], ["node/zlib"], lib);
    assert.deepEqual(zlib.globals, empty.globals);
    for (const [profile, builtins] of [
        [subset, bufferModules],
        [zlib, [...bufferModules, "async_hooks", "events", "stream", "stream/iter", "stream/promises", "zlib"]],
    ]) {
        const added = [...profile.modules.keys()].filter(name => !empty.modules.has(name)).sort();
        const expected = builtins.flatMap(name => [JSON.stringify(name), JSON.stringify("node:" + name)]).sort();
        assert.deepEqual(added, expected);
        for (const name of added) assert.deepEqual(profile.modules.get(name), legacy.modules.get(name), name);
    }
}

// Inspect resolved signatures at a consumer expression. Comparing just the
// interface names misses duplicate construct signatures and lost overload docs.
function bufferSignatures(dir) {
    const ts = require("typescript");
    const entry = join(dir, "signatures.ts");
    writeFileSync(entry, 'import { Buffer as B } from "node:buffer";\nexport const ctor = B;\nexport const value = B.alloc(1);\n');
    const program = ts.createProgram([entry], {
        module: ts.ModuleKind.NodeNext, target: ts.ScriptTarget.ESNext, strict: true, types: ["node"],
        typeRoots: [join(dir, "node_modules/@types")], lib: ["lib.esnext.d.ts"],
    });
    const checker = program.getTypeChecker();
    const signatures = new Map();
    for (const statement of program.getSourceFile(entry).statements.filter(ts.isVariableStatement)) {
        const variable = statement.declarationList.declarations[0];
        const type = checker.getTypeAtLocation(variable.name);
        const record = (name, overloads) => {
            if (!overloads.length) return;
            // Well-known symbol names include a compiler-assigned numeric ID.
            const key = variable.name.text + "." + name.replace(/^(__@.*)@\d+$/, "$1");
            signatures.set(key, overloads.map(signature => ({
                signature: checker.signatureToString(signature, variable, ts.TypeFormatFlags.NoTruncation),
                docs: ts.displayPartsToString(signature.getDocumentationComment(checker)),
                tags: signature.getJsDocTags().map(tag => [tag.name, ts.displayPartsToString(tag.text)]),
            })));
        };
        record("new", type.getConstructSignatures());
        for (const member of type.getProperties()) {
            record(member.name, checker.getTypeOfSymbolAtLocation(member, variable).getCallSignatures());
        }
    }
    return signatures;
}

function nodeFiles(dir, files) {
    return files.filter(file => file.startsWith(packageDir(dir) + sep)).map(file => relative(packageDir(dir), file));
}

function compile(dir, types, host, mode, roots, subset = false, lib = "ESNext", comparison) {
    const files = comparison?.files ?? (subset
        ? ["buffer", ...(oldBuffers || lib !== "ESNext" ? [] : ["modern"]), ...(host ? [] : ["es-only"]), ...(lib === "ES2020" ? ["es2020"] : [])]
        : ["legacy"]);
    const options = {
        target: "ESNext", module: mode === "bundler" ? "ESNext" : "NodeNext", moduleResolution: mode === "nodenext-esm" ? "nodenext" : mode,
        lib: [lib, ...(host ? [host] : [])], strict: true, skipLibCheck: false, types, declaration: true,
        emitDeclarationOnly: true, rootDir: "./fixtures", outDir: "./out", ...(roots ? { typeRoots: ["./node_modules/@types"] } : {}),
    };
    // Both package consumers and their declaration dependencies are local to this staging directory.
    writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: options, files: files.map(f => "fixtures/" + f + ".ts") }));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ type: mode === "nodenext" ? "commonjs" : "module" }));
    rmSync(join(dir, "out"), { recursive: true, force: true });
    let output;
    try {
        output = run(["-p", "tsconfig.json", "--pretty", "false", "--listFiles"], dir);
    } catch (error) {
        if (error.status !== 2 && error.status !== 1) throw error;
        output = String(error.stdout);
    }
    count++;
    const lines = output.trim().split(/\r?\n/);
    const isInput = line => /\.(?:[cm]?ts|tsx)$/.test(line) && existsSync(resolve(dir, line));
    const filesRead = lines.filter(isInput).map(file => resolve(dir, file));
    const diagnostics = lines.filter(line => !isInput(line)).join("\n").replaceAll(dir, "<consumer>");
    if (subset) assert.equal(diagnostics, "", types.join("+") + " " + host + " " + mode);
    if (subset) {
        const loaded = nodeFiles(dir, filesRead);
        assert.ok(loaded.length > 0 && loaded.every(f => /^(?:(?:ts5\.[67]\/)?(?:select\/|stream\/web\.d\.ts$|buffer(?:\.buffer)?\.d\.ts$))/.test(f)), String(loaded));
        assert.ok(!filesRead.some(f => f.includes("/undici-types/")));
        bufferCounts.add(loaded.length);
    }
    return { files: filesRead, diagnostics, declaration: readFileSync(join(dir, "out", (comparison?.emit ?? files[0]) + ".d.ts"), "utf8") };
}

function checkZlibIdentity(ts, types) {
    const dir = targets[1];
    const entry = join(dir, "fixtures/zlib-api.ts");
    const program = ts.createProgram([entry], {
        module: ts.ModuleKind.NodeNext, target: ts.ScriptTarget.ESNext, strict: true, types,
        typeRoots: [join(dir, "node_modules/@types")], lib: ["lib.esnext.d.ts"],
    });
    const checker = program.getTypeChecker();
    const bindings = program.getSourceFile(entry).statements.filter(ts.isVariableStatement)
        .flatMap(statement => [...statement.declarationList.declarations]);
    const symbolOf = name => checker.getTypeAtLocation(bindings.find(binding => binding.name.text === name).name).getSymbol();
    const result = symbolOf("bytes");
    assert.equal(result?.name, "Buffer");
    assert.equal(result, symbolOf("sameBuffer"), "gzipSync and the imported Buffer must resolve to the same symbol");
    assert.ok(result.declarations.some(node => node.getSourceFile().fileName.endsWith("/select/buffer-core.d.ts")));
}

const zlibDependencies = [
    "zlib.d.ts", "stream.d.ts", "stream/iter.d.ts", "stream/promises.d.ts", "events.d.ts", "select/async-hooks.d.ts", "select/async-hooks-core.d.ts",
    "select/emitter.d.ts", "select/stream-types.d.ts", "select/zlib-bindings.d.ts", "select/zlib-nodejs.d.ts",
];

function checkZlib(host, mode, roots, bufferFiles, lib = "ESNext") {
    const candidate = targets[1];
    const options = [host, mode, roots, false, lib];
    const fixtures = { files: ["zlib-api", "zlib-isolation", lib === "ESNext" ? "zlib-disposal" : "zlib-es2020", ...(host ? [] : ["es-only"])] };
    const subset = compile(candidate, ["node/zlib"], ...options, fixtures);
    assert.equal(subset.diagnostics, "");
    zlibCounts.add(nodeFiles(candidate, subset.files).length);
    const expected = new Set(bufferFiles);
    const pkg = packageDir(candidate);
    for (const file of zlibDependencies) expected.add(join(pkg, file));
    const routed = version.match(/^Version (5\.[67])\./);
    if (routed) {
        expected.add(join(pkg, "ts" + routed[1], "select/zlib-bindings.d.ts"));
        expected.add(join(pkg, "ts" + routed[1], "select/emitter.d.ts"));
        if (!roots) expected.add(join(pkg, "ts" + routed[1], "zlib.d.ts"));
    }
    // Compare *all* inputs, including ES libraries and external packages. The
    // Buffer and zlib consumer programs naturally have different fixture files.
    const dependencies = files => new Set([...files].filter(file => !file.startsWith(join(candidate, "fixtures") + sep)));
    assert.deepEqual(dependencies(subset.files), dependencies(expected), "unexpected zlib dependency graph");
    for (const types of [["node/zlib", "node/buffer"], ["node/buffer", "node/zlib"]]) {
        const both = compile(candidate, types, ...options, fixtures);
        assert.equal(both.diagnostics, "");
        assert.deepEqual(new Set(both.files), new Set(subset.files), "selecting Buffer must add zero files");
        assert.equal(both.declaration, subset.declaration);
    }

    // A downstream project must be able to name even the inferred iterator and pipe signatures.
    writeFileSync(join(candidate, "fixtures/zlib-emitted.d.ts"), subset.declaration);
    const consumer = compile(candidate, ["node/zlib"], ...options, { files: ["use-zlib-output"] });
    assert.equal(consumer.diagnostics, "", "consume the emitted zlib declaration");

    if (!host && mode === "nodenext" && !roots && lib === "ESNext") {
        const consumerWithGlobals = compile(candidate, ["node"], ...options, { files: ["use-zlib-output"] });
        assert.equal(consumerWithGlobals.diagnostics, "", "a full Node project can consume the isolated declaration");
    }
    if (lib === "ESNext") {
        const fullFixtures = { files: ["zlib-api", "zlib-globals"] };
        const base = compile(targets[0], ["node"], ...options, fullFixtures);
        const globalsOutput = dir => readFileSync(join(dir, "out/zlib-globals.d.ts"), "utf8");
        for (const types of [["node"], ["node/zlib", "node/globals"], ["node/globals", "node/zlib"]]) {
            const full = compile(candidate, types, ...options, fullFixtures);
            assert.equal(full.diagnostics, base.diagnostics);
            assert.equal(full.declaration, base.declaration, "full zlib API declaration emit");
            assert.equal(globalsOutput(candidate), globalsOutput(targets[0]), "zlib global augmentation emit");
            const loaded = new Set(full.files);
            for (const file of nodeFiles(candidate, subset.files)) assert.ok(loaded.has(join(pkg, file)), file);
        }
    }
}
function checkSelectors() {
    if (compiler === require.resolve("typescript/bin/tsc")) {
        const upstream = bufferSignatures(targets[0]);
        const candidate = bufferSignatures(targets[1]);
        assert.deepEqual([...candidate.keys()].sort(), [...upstream.keys()].sort());
        for (const [name, overloads] of upstream) assert.deepEqual(candidate.get(name), overloads, name);
    }
    const api = resolve(dirname(realpathSync(compiler)), "../lib/typescript.js");
    if (existsSync(api)) {
        const ts = require(api);
        assert.equal("Version " + ts.version, version);
        for (const types of [["node/zlib"], ["node/zlib", "node/buffer"], ["node/buffer", "node/zlib"]]) {
            checkZlibIdentity(ts, types);
        }
        for (const libs of [["es2020"], ["esnext"], ["esnext", "dom"], ["esnext", "webworker"]]) {
            checkSelectorSurface(ts, libs);
        }
    }
    // Direct selection of async_hooks already worked upstream with ES disposal types.
    // It must not acquire the streams, events or Buffer dependency graph.
    const hooks = { files: ["standalone-async-hooks"] };
    const hooksOptions = [["node/async_hooks"], "", "nodenext", true, false, "ESNext", hooks];
    const previousHooks = compile(targets[0], ...hooksOptions);
    const currentHooks = compile(targets[1], ...hooksOptions);
    assert.equal(previousHooks.diagnostics, "");
    assert.equal(currentHooks.diagnostics, previousHooks.diagnostics);
    assert.equal(currentHooks.declaration, previousHooks.declaration);
    assert.deepEqual(nodeFiles(targets[1], currentHooks.files).sort(), ["async_hooks.d.ts", "select/async-hooks-core.d.ts"]);
    const es2020 = compile(targets[1], ["node/buffer"], "", "nodenext", false, true, "ES2020");
    checkZlib("", "nodenext", false, es2020.files, "ES2020");
    const esm = compile(targets[1], ["node/buffer"], "", "nodenext-esm", false, true);
    checkZlib("", "nodenext-esm", false, esm.files);
    for (const host of ["", "DOM", "WebWorker"]) {
        for (const mode of ["nodenext", "bundler"]) {
            for (const roots of [false, true]) {
                const subset = compile(targets[1], ["node/buffer"], host, mode, roots, true);
                checkZlib(host, mode, roots, subset.files);
                if (values["zlib-only"]) continue;
                const shared = nodeFiles(targets[1], subset.files);
                const base = compile(targets[0], ["node"], host, mode, roots);
                if (base.diagnostics) baselineErrors.add((host || "ES") + " " + [...base.diagnostics.matchAll(/error (TS\d+)/g)].map(match => match[1]).join(","));
                let full;
                for (const selection of [["node"], ["node/globals"], ["node/buffer", "node/globals"], ["node", "node/buffer"], ["node/buffer", "node"]]) {
                    const actual = compile(targets[1], selection, host, mode, roots);
                    assert.equal(actual.diagnostics, base.diagnostics, selection.join("+") + " diagnostics");
                    assert.equal(actual.declaration, base.declaration, selection.join("+") + " declaration emit");
                    const loaded = new Set(nodeFiles(targets[1], actual.files));
                    for (const file of shared) assert.ok(loaded.has(file), selection.join("+") + " must load " + file);
                    if (selection[0] === "node" && selection.length === 1) full = loaded;
                    if (selection.includes("node") && selection.includes("node/buffer")) {
                        assert.deepEqual(loaded, full, "combining selectors must load exactly the same Node files");
                    }
                }
            }
        }
    }
    console.log(version + " matched the baseline diagnostics and declaration emit for the selector fixtures across " + count
        + " builds, including subset isolation checks. Buffer-only loaded " + [...bufferCounts].join("/") + " Node declaration files; zlib-only loaded " + [...zlibCounts].join("/") + ".");
    if (baselineErrors.size) console.log("Inherited baseline diagnostics: " + [...baselineErrors].join(" / "));
}

try {
    stage();
    if (!values["overloads-only"]) checkSelectors();
    if (!values["zlib-only"]) checkOverloadOrder();
} finally {
    rmSync(tmp, { recursive: true, force: true });
}

function checkOverloadOrder() {
    const orders = [
        ["order"],
        ["load-node-first", "order"],
        ["load-node-first", "order-peer", "order"],
        ["load-node-first", "order", "order-peer"],
        ["order-peer", "load-node-first", "order"],
    ];
    const selections = [["node"], ["node/globals"], ["node/buffer", "node/globals"], ["node", "node/buffer"], ["node/buffer", "node"], ["node/zlib", "node/globals"], ["node", "node/zlib"]];
    const baselineDeclarations = new Set();
    for (const files of orders) {
        const comparison = { files, emit: "order" };
        const base = compile(targets[0], ["node"], "", "nodenext", false, false, "ESNext", comparison);
        assert.equal(base.diagnostics, "", "the upstream overload fixture must compile");
        baselineDeclarations.add(base.declaration);
        for (const types of selections) {
            const actual = compile(targets[1], types, "", "nodenext", false, false, "ESNext", comparison);
            const context = types.join("+") + " with files " + files.join(", ");
            assert.equal(actual.diagnostics, base.diagnostics, context);
            assert.equal(actual.declaration, base.declaration, context);
        }
    }
    assert.ok(baselineDeclarations.size >= 3, "the upstream fixtures must exercise different overload orders");
    console.log(version + " matched upstream declaration emit for " + orders.length + " overload orders across "
        + selections.length + " selector combinations.");
}
