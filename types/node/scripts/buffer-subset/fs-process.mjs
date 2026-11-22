import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const filesystem = ["async_hooks", "buffer", "events", "fs", "fs/promises", "readline", "readline/promises", "stream",
    "stream/iter", "stream/promises", "stream/web"];
const processModules = [...filesystem, "child_process", "dgram", "dns", "dns/promises", "net", "perf_hooks", "process",
    "tty", "v8", "vm", "worker_threads"];

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
                    assert.equal(run(["use-augmented-output"], ["node"]).diagnostics, "", "downstream global augmentation");
                }
            }
            if (!host && mode === "nodenext") console.log(version + " node/" + selector + " loaded " + graph.size + " Node declarations.");
        }
    }
    for (const mode of ["nodenext", "nodenext-esm"]) {
        for (const file of ["fs-api", "process-api"]) {
            const base = builds(baseline, ["node"], [file], "", mode);
            assert.equal(base.diagnostics, "");
            for (const selection of [["node"], ["node/globals"], ["node/process", "node"], ["node", "node/fs"]]) {
                const result = builds(candidate, selection, [file], "", mode);
                assert.equal(result.diagnostics, base.diagnostics, file);
                assert.equal(result.declaration, base.declaration, file + " full declaration emit");
            }
        }
    }
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
    console.log(version + " verified fs and process isolation, augmentation and downstream declaration emit.");
}
