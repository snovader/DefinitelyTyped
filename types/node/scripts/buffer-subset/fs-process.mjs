import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import parser from "typescript";

const filesystem = ["async_hooks", "buffer", "events", "fs", "fs/promises", "readline", "readline/promises", "stream",
    "stream/iter", "stream/promises", "stream/web"];
const processModules = [...filesystem, "child_process", "dgram", "dns", "dns/promises", "net", "perf_hooks", "process",
    "tty", "v8", "vm", "worker_threads"];

function processInterfaces(files) {
    const interfaces = [];
    for (const path of files) {
        const source = readFileSync(path, "utf8");
        if (!source.includes("interface Process ")) continue;
        const visit = node => {
            if (parser.isInterfaceDeclaration(node) && node.name.text === "Process") interfaces.push(node);
            else parser.forEachChild(node, visit);
        };
        visit(parser.createSourceFile(path, source, parser.ScriptTarget.Latest, true));
    }
    return interfaces;
}

// Compare the complete imported value, including overloads inherited by process.
export function publicValueMembers(ts, checker, module) {
    const target = checker.resolveExternalModuleSymbol(module);
    const location = target.valueDeclaration ?? module.declarations[0];
    const type = checker.getTypeOfSymbolAtLocation(target, location);
    const signatures = list => list.map(signature => [
        signature.minArgumentCount, signature.parameters.length, signature.typeParameters?.length ?? 0,
    ]);
    const members = new Map();
    for (const member of type.getProperties()) {
        const property = checker.getTypeOfSymbolAtLocation(member, member.valueDeclaration ?? location);
        members.set(member.name.replace(/@\d+$/, ""), [
            Boolean(member.flags & ts.SymbolFlags.Optional),
            signatures(property.getCallSignatures()), signatures(property.getConstructSignatures()),
            ...(module.name === '"node:process"' ? [
                ts.displayPartsToString(member.getDocumentationComment(checker)),
                member.getJsDocTags(checker).map(tag => [tag.name, ts.displayPartsToString(tag.text)]),
            ] : []),
        ]);
    }
    return members;
}

export function checkFsProcess({ baseline, candidate, compile, surface, ts, nodeFiles, version }) {
    const builds = (dir, types, files, host = "", mode = "nodenext", roots = false, lib = "ESNext") =>
        compile(dir, types, host, mode, roots, false, lib, { files });
    if (ts) {
        for (const lib of [["es2020"], ["esnext", "dom"], ["esnext", "webworker"]]) {
            const empty = surface(ts, candidate, [], lib);
            const upstream = surface(ts, baseline, ["node"], lib, true);
            const full = surface(ts, candidate, ["node"], lib, true);
            assert.deepEqual(full.values, upstream.values);
            for (const [selector, expected] of [["fs", filesystem], ["process", processModules]]) {
                const scoped = surface(ts, candidate, ["node/" + selector], lib, true);
                for (const [name, value] of scoped.values) assert.deepEqual(value, upstream.values.get(name), name);
                assert.deepEqual(scoped.globals, empty.globals, selector + " global names");
                const names = expected.flatMap(name => [name, "node:" + name]).map(name => JSON.stringify(name)).sort();
                assert.deepEqual([...scoped.modules.keys()].sort(), names, selector + " built-in dependencies");
                for (const name of names) assert.deepEqual(scoped.modules.get(name), upstream.modules.get(name), name);
            }
        }
    }

    // Exercise declaration serialization independently of the split in the candidate.
    // The private BuiltInModule return type has its own diagnostic regression test.
    const [original] = processInterfaces([join(baseline, "node_modules/@types/node/process.d.ts")]);
    const methodNames = node => node.members.filter(parser.isMethodSignature).map(member => member.name.text);
    const checkOneProcess = result => {
        const files = nodeFiles(candidate, result.files).map(file => join(candidate, "node_modules/@types/node", file));
        const groups = processInterfaces(files).map(methodNames);
        assert.deepEqual(groups, [methodNames(original)], "the selector must load a single original Process overload group");
    };
    const members = new Set(original.members.map(member => member.name.text));
    assert.ok(members.delete("getBuiltinModule"));
    const extracted = 'import proc from "node:process";\n' + [...members].map(name => "export const " + name + " = proc." + name + ";").join("\n");
    for (const dir of [baseline, candidate]) writeFileSync(join(dir, "fixtures/process-extracted.ts"), extracted);
    for (const [host, mode, roots, lib] of [
        ["", "nodenext", false, "ES2020"], ["", "nodenext-esm", false, "ESNext"],
        ["DOM", "bundler", true, "ESNext"], ["WebWorker", "nodenext", true, "ESNext"],
    ]) {
        for (const selector of ["fs", "process"]) {
            const types = ["node/" + selector];
            const run = (files, selection = types) => builds(candidate, selection, files, host, mode, roots, lib);
            const files = [selector + "-api", "fs-process-isolation", selector + "-isolation"];
            const isolated = run(files);
            assert.equal(isolated.diagnostics, "", [selector, host, mode, lib].join(" "));
            const graph = new Set(nodeFiles(candidate, isolated.files));
            if (selector === "process") {
                if (!host && mode === "nodenext") checkOneProcess(isolated);
                assert.ok(graph.has("select/process-register.d.ts") && graph.has("select/process-properties.d.ts"));
                assert.ok(graph.has("select/process-types.d.ts") && !graph.has("legacy/process.d.ts"));
            }
            assert.ok(!isolated.files.some(file => file.includes("/undici-types/")));
            assert.ok(![...graph].some(file => /(?:^|\/)(?:index|globals)\.d\.ts$|^legacy\//.test(file)));
            for (const dep of selector === "fs" ? ["node/buffer"] : ["node/fs", "node/buffer"]) {
                for (const order of [[dep, ...types], [...types, dep]]) {
                    const combined = run(files, order);
                    assert.equal(combined.diagnostics, "");
                    assert.deepEqual(new Set(combined.files), new Set(isolated.files), order.join("+"));
                    assert.equal(combined.declaration, isolated.declaration);
                }
            }
            writeFileSync(join(candidate, "fixtures", selector + "-emitted.d.ts"), isolated.declaration);
            const consumer = run(["use-" + selector + "-output"]);
            assert.equal(consumer.diagnostics, "", selector + " downstream emit");
            if (!host) {
                const downstream = run(["use-" + selector + "-output"], ["node"]);
                assert.equal(downstream.diagnostics, "", selector + " downstream full");
                if (selector === "process") {
                    const explicitImports = run(["use-" + selector + "-output"], []);
                    assert.equal(explicitImports.diagnostics, "", "consume isolated declarations with types: []");
                    assert.ok(!nodeFiles(candidate, explicitImports.files).includes("legacy/process.d.ts"));
                    assert.equal(run(["use-augmented-output"], ["node"]).diagnostics, "", "downstream global augmentation");
                }
            }
            if (!host && mode === "nodenext") console.log(version + " node/" + selector + " loaded " + graph.size + " Node declarations.");
        }
    }
    for (const mode of ["nodenext", "nodenext-esm"]) {
        for (const file of ["fs-api", "process-api", "process-extracted"]) {
            const base = builds(baseline, ["node"], [file], "", mode);
            assert.equal(base.diagnostics, "");
            for (const selection of [["node"], ["node/globals"], ["node/process", "node"], ["node", "node/fs"]]) {
                const result = builds(candidate, selection, [file], "", mode);
                const graph = nodeFiles(candidate, result.files);
                if (mode === "nodenext" && file === "process-extracted" && selection.length === 1) checkOneProcess(result);
                assert.ok(graph.includes("select/process-register.d.ts") && graph.includes("select/process-properties.d.ts"));
                assert.ok(graph.includes("legacy/process.d.ts"));
                assert.equal(graph.includes("select/process-types.d.ts"), selection.includes("node/process"), selection.join("+"));
                assert.equal(result.diagnostics, base.diagnostics, file);
                assert.equal(result.declaration, base.declaration, file + " full declaration emit");
            }
        }
    }
    const dependencyScope = builds(candidate, ["node/fs"], ["process-dependency-scope"]);
    assert.equal(dependencyScope.diagnostics, "");
    assert.ok(!nodeFiles(candidate, dependencyScope.files).some(file => file === "select/process-types.d.ts" || file === "legacy/process.d.ts"));
    const promises = builds(candidate, ["node/fs/promises"], ["fs-api", "fs-isolation", "fs-process-isolation"]);
    assert.equal(promises.diagnostics, "", "direct fs/promises entry");
    const zipped = builds(candidate, ["node/process", "node/zlib"], ["process-with-zlib", "fs-process-isolation"]);
    assert.equal(zipped.diagnostics, "");
    for (const order of [["fs-process-globals"], ["load-node-first", "fs-process-globals"]]) {
        const compare = (dir, types) => compile(dir, types, "", "nodenext", false, false, "ESNext", { files: order, emit: "fs-process-globals" });
        const upstream = compare(baseline, ["node"]);
        assert.equal(upstream.diagnostics, "");
        for (const types of [["node"], ["node/globals"], ["node/process", "node/globals"], ["node/globals", "node/process"],
            ["node/fs", "node"], ["node", "node/process"]]) {
            const result = compare(candidate, types);
            if (!types.includes("node") && !order.includes("load-node-first")) {
                assert.ok(!nodeFiles(candidate, result.files).some(file => /^(?:ts5\.[67]\/)?index\.d\.ts$/.test(file)));
            }
            assert.equal(result.diagnostics, upstream.diagnostics, types.join("+") + " diagnostics");
            assert.equal(result.declaration, upstream.declaration, types.join("+") + " augmentation emit");
        }
    }
    for (const exactOptionalPropertyTypes of [false, true]) {
        const options = { files: ["process-extracted", "process-redeclaration"], exactOptionalPropertyTypes };
        const compare = dir => compile(dir, ["node"], "", "nodenext", false, false, "ESNext", options);
        const upstream = compare(baseline);
        const result = compare(candidate);
        assert.equal(upstream.diagnostics, "");
        assert.equal(result.diagnostics, "");
        assert.equal(result.declaration, upstream.declaration);
    }
    const orders = [
        ["process-order"], ["load-node-first", "process-order"],
        ["load-node-first", "process-order-peer", "process-order"],
        ["load-node-first", "process-order", "process-order-peer"],
        ["process-order-peer", "load-node-first", "process-order"],
    ];
    const outputs = new Set();
    for (const files of orders) {
        const compare = (dir, types) => compile(dir, types, "", "nodenext", false, false, "ESNext", { files, emit: "process-order" });
        const upstream = compare(baseline, ["node"]);
        assert.equal(upstream.diagnostics, "");
        outputs.add(upstream.declaration);
        for (const types of [["node"], ["node/globals"], ["node/process", "node"], ["node", "node/process"]]) {
            const result = compare(candidate, types);
            assert.equal(result.diagnostics, "");
            assert.equal(result.declaration, upstream.declaration, types.join("+") + " with " + files.join(", "));
        }
    }
    assert.ok(outputs.size >= 3, "the fixture must distinguish different upstream overload orders");
    console.log(version + " verified fs and process isolation, augmentation and downstream declaration emit.");
}
