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
    tsc: { type: "string", default: require.resolve("typescript/bin/tsc") },
} });
const compiler = resolve(values.tsc);
const run = (args, cwd) => execFileSync(compiler, args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
const version = run(["--version"], here).trim();
const oldBuffers = version.startsWith("Version 5.6.");
const tmp = realpathSync(mkdtempSync(join(tmpdir(), "dt-buffer-")));
const targets = ["baseline", "candidate"].map(name => join(tmp, name));
const dependency = dirname(require.resolve("undici-types/package.json", { paths: [nodeDir] }));
const results = new Set();
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
function surface(dir, types, lib) {
    const ts = require("typescript");
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

function checkBufferSurface(lib) {
    const empty = surface(targets[1], [], lib);
    const subset = surface(targets[1], ["node/buffer"], lib);
    const legacy = surface(targets[0], ["node"], lib);
    assert.deepEqual(subset.globals, empty.globals);
    const added = [...subset.modules.keys()].filter(name => !empty.modules.has(name)).sort();
    assert.deepEqual(added, ['"buffer"', '"node:buffer"', '"node:stream/web"', '"stream/web"']);
    for (const name of added) assert.deepEqual(subset.modules.get(name), legacy.modules.get(name), name);
}

// Compare every input to the legacy compiler program, in load order. Only the
// two relocated files and the corresponding path directives may differ.
function legacyGraph(dir, files) {
    return files.map(file => {
        const name = relative(dir, file).replaceAll(sep, "/").replace("/node/legacy/", "/node/");
        let content = readFileSync(file, "utf8");
        if (/node_modules\/@types\/node\/(ts5\.[67]\/)?index\.d\.ts$/.test(name)) {
            content = content.replaceAll("legacy/buffer.d.ts", "buffer.d.ts").replaceAll("legacy/globals.d.ts", "globals.d.ts");
        }
        return [name, content];
    });
}

function compile(dir, types, host, mode, roots, subset = false, lib = "ESNext") {
    const files = subset ? ["buffer", ...(oldBuffers || lib !== "ESNext" ? [] : ["modern"]), ...(host ? [] : ["es-only"]), ...(lib === "ES2020" ? ["es2020"] : [])] : ["legacy"];
    const options = {
        target: "ESNext", module: mode === "bundler" ? "ESNext" : "NodeNext", moduleResolution: mode,
        lib: [lib, ...(host ? [host] : [])], strict: true, skipLibCheck: false, types, declaration: true,
        emitDeclarationOnly: true, rootDir: "./fixtures", outDir: "./out", ...(roots ? { typeRoots: ["./node_modules/@types"] } : {}),
    };
    // Both package consumers and their declaration dependencies are local to this staging directory.
    writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: options, files: files.map(f => "fixtures/" + f + ".ts") }));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ type: mode === "bundler" ? "module" : "commonjs" }));
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
        const loaded = filesRead.filter(f => f.startsWith(packageDir(dir) + sep)).map(f => relative(packageDir(dir), f));
        assert.ok(loaded.length > 0 && loaded.every(f => /^(?:(?:ts5\.[67]\/)?(?:select\/|buffer\.d\.ts$))/.test(f)), String(loaded));
        assert.ok(!filesRead.some(f => f.includes("/undici-types/")));
        results.add(loaded.length);
    }
    return { files: filesRead, diagnostics, declaration: readFileSync(join(dir, "out", files[0] + ".d.ts"), "utf8") };
}

try {
    stage();
    if (compiler === require.resolve("typescript/bin/tsc")) {
        for (const libs of [["es2020"], ["esnext"], ["esnext", "dom"], ["esnext", "webworker"]]) {
            checkBufferSurface(libs);
        }
    }
    compile(targets[1], ["node/buffer"], "", "nodenext", false, true, "ES2020");
    for (const host of ["", "DOM", "WebWorker"]) {
        for (const mode of ["nodenext", "bundler"]) {
            for (const roots of [false, true]) {
                compile(targets[1], ["node/buffer"], host, mode, roots, true);
                const base = compile(targets[0], ["node"], host, mode, roots);
                if (base.diagnostics) baselineErrors.add((host || "ES") + " " + [...base.diagnostics.matchAll(/error (TS\d+)/g)].map(match => match[1]).join(","));
                const expected = legacyGraph(targets[0], base.files);
                for (const selection of [["node"], ["node/globals"], ["node/buffer", "node/globals"], ["node", "node/buffer"], ["node/buffer", "node"]]) {
                    const actual = compile(targets[1], selection, host, mode, roots);
                    assert.equal(actual.diagnostics, base.diagnostics, selection.join("+") + " diagnostics");
                    assert.equal(actual.declaration, base.declaration, selection.join("+") + " declaration emit");
                    if (selection.length === 1) {
                        // Exclude only the additional selector, preserving the relocated legacy globals.
                        const underlying = actual.files.filter(file => selection[0] === "node" ||
                            !/^(ts5\.[67]\/)?globals\.d\.ts$/.test(relative(packageDir(targets[1]), file)));
                        const graph = legacyGraph(targets[1], underlying);
                        assert.deepEqual(graph.map(([name]) => name), expected.map(([name]) => name));
                        for (let i = 0; i < expected.length; i++) assert.equal(graph[i][1], expected[i][1], expected[i][0]);
                    }
                }
            }
        }
    }
    console.log(version + " matched expectations in " + count + " consumer builds. Buffer-only loaded " + [...results].join("/") + " Node declaration files.");
    if (baselineErrors.size) console.log("Inherited baseline diagnostics: " + [...baselineErrors].join(" / "));
} finally {
    rmSync(tmp, { recursive: true, force: true });
}
