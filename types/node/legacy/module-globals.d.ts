declare module "node:module" {
    global {
        namespace NodeJS {
            interface Module {
                /**
                 * The module objects required for the first time by this one.
                 * @since v0.1.16
                 */
                children: Module[];
                /**
                 * The `module.exports` object is created by the `Module` system. Sometimes this is
                 * not acceptable; many want their module to be an instance of some class. To do
                 * this, assign the desired export object to `module.exports`.
                 * @since v0.1.16
                 */
                exports: any;
                /**
                 * The fully resolved filename of the module.
                 * @since v0.1.16
                 */
                filename: string;
                /**
                 * The identifier for the module. Typically this is the fully resolved
                 * filename.
                 * @since v0.1.16
                 */
                id: string;
                /**
                 * `true` if the module is running during the Node.js preload
                 * phase.
                 * @since v15.4.0, v14.17.0
                 */
                isPreloading: boolean;
                /**
                 * Whether or not the module is done loading, or is in the process of
                 * loading.
                 * @since v0.1.16
                 */
                loaded: boolean;
                /**
                 * The module that first required this one, or `null` if the current module is the
                 * entry point of the current process, or `undefined` if the module was loaded by
                 * something that is not a CommonJS module (e.g. REPL or `import`).
                 * @since v0.1.16
                 * @deprecated Please use `require.main` and `module.children` instead.
                 */
                parent: Module | null | undefined;
                /**
                 * The directory name of the module. This is usually the same as the
                 * `path.dirname()` of the `module.id`.
                 * @since v11.14.0
                 */
                path: string;
                /**
                 * The search paths for the module.
                 * @since v0.4.0
                 */
                paths: string[];
                /**
                 * The `module.require()` method provides a way to load a module as if
                 * `require()` was called from the original module.
                 * @since v0.5.1
                 */
                require(id: string): any;
            }
            interface Require {
                /**
                 * Used to import modules, `JSON`, and local files.
                 * @since v0.1.13
                 */
                (id: string): any;
                /**
                 * Modules are cached in this object when they are required. By deleting a key
                 * value from this object, the next `require` will reload the module.
                 * This does not apply to
                 * [native addons](https://nodejs.org/docs/latest-v26.x/api/addons.html),
                 * for which reloading will result in an error.
                 * @since v0.3.0
                 */
                cache: Dict<Module>;
                /**
                 * Instruct `require` on how to handle certain file extensions.
                 * @since v0.3.0
                 * @deprecated
                 */
                extensions: RequireExtensions;
                /**
                 * The `Module` object representing the entry script loaded when the Node.js
                 * process launched, or `undefined` if the entry point of the program is not a
                 * CommonJS module.
                 * @since v0.1.17
                 */
                main: Module | undefined;
                /**
                 * @since v0.3.0
                 */
                resolve: RequireResolve;
            }
            /** @deprecated */
            interface RequireExtensions extends Dict<(module: Module, filename: string) => any> {
                ".js": (module: Module, filename: string) => any;
                ".json": (module: Module, filename: string) => any;
                ".node": (module: Module, filename: string) => any;
            }
            interface RequireResolveOptions {
                /**
                 * Paths to resolve module location from. If present, these
                 * paths are used instead of the default resolution paths, with the exception
                 * of
                 * [GLOBAL\_FOLDERS](https://nodejs.org/docs/latest-v26.x/api/modules.html#loading-from-the-global-folders)
                 * like `$HOME/.node_modules`, which are
                 * always included. Each of these paths is used as a starting point for
                 * the module resolution algorithm, meaning that the `node_modules` hierarchy
                 * is checked from this location.
                 * @since v8.9.0
                 */
                paths?: string[] | undefined;
            }
            interface RequireResolve {
                /**
                 * Use the internal `require()` machinery to look up the location of a module,
                 * but rather than loading the module, just return the resolved filename.
                 *
                 * If the module can not be found, a `MODULE_NOT_FOUND` error is thrown.
                 * @since v0.3.0
                 * @param request The module path to resolve.
                 */
                (request: string, options?: RequireResolveOptions): string;
                /**
                 * Returns an array containing the paths searched during resolution of `request` or
                 * `null` if the `request` string references a core module, for example `http` or
                 * `fs`.
                 * @since v8.9.0
                 * @param request The module path whose lookup paths are being retrieved.
                 */
                paths(request: string): string[] | null;
            }
        }
        /**
         * The directory name of the current module. This is the same as the
         * `path.dirname()` of the `__filename`.
         * @since v0.1.27
         */
        var __dirname: string;
        /**
         * The file name of the current module. This is the current module file's absolute
         * path with symlinks resolved.
         *
         * For a main program this is not necessarily the same as the file name used in the
         * command line.
         * @since v0.0.1
         */
        var __filename: string;
        /**
         * The `exports` variable is available within a module's file-level scope, and is
         * assigned the value of `module.exports` before the module is evaluated.
         * @since v0.1.16
         */
        var exports: NodeJS.Module["exports"];
        /**
         * A reference to the current module.
         * @since v0.1.16
         */
        var module: NodeJS.Module;
        /**
         * @since v0.1.13
         */
        var require: NodeJS.Require;
        // Global-scope aliases for backwards compatibility with @types/node <13.0.x
        // TODO: consider removing in a future major version update
        /** @deprecated Use `NodeJS.Module` instead. */
        interface NodeModule extends NodeJS.Module {}
        /** @deprecated Use `NodeJS.Require` instead. */
        interface NodeRequire extends NodeJS.Require {}
        /** @deprecated Use `NodeJS.RequireResolve` instead. */
        interface RequireResolve extends NodeJS.RequireResolve {}
    }
    export {};
}
