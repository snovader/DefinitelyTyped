import type { exit } from "node:process";
import type { Module } from "node/select/process-support.js";
import type {
    Architecture,
    HRTime,
    MemoryUsageFn,
    Platform,
    ProcessConfig,
    ProcessEnv,
    ProcessFeatures,
    ProcessPermission,
    ProcessRelease,
    ProcessReport,
    ProcessVersions,
    ReadStream,
    WriteStream,
} from "node/select/process-context.js";

export interface ProcessProperties<Channel, SetGroups, EnvironmentFlags> {
    /**
     * The `process.stdout` property returns a stream connected to`stdout` (fd `1`). It is a `net.Socket` (which is a `Duplex` stream) unless fd `1` refers to a file, in which case it is
     * a `Writable` stream.
     *
     * For example, to copy `process.stdin` to `process.stdout`:
     *
     * ```js
     * import { stdin, stdout } from 'node:process';
     *
     * stdin.pipe(stdout);
     * ```
     *
     * `process.stdout` differs from other Node.js streams in important ways. See `note on process I/O` for more information.
     */
    stdout: WriteStream & {
        fd: 1;
    };
    /**
     * The `process.stderr` property returns a stream connected to`stderr` (fd `2`). It is a `net.Socket` (which is a `Duplex` stream) unless fd `2` refers to a file, in which case it is
     * a `Writable` stream.
     *
     * `process.stderr` differs from other Node.js streams in important ways. See `note on process I/O` for more information.
     */
    stderr: WriteStream & {
        fd: 2;
    };
    /**
     * The `process.stdin` property returns a stream connected to`stdin` (fd `0`). It is a `net.Socket` (which is a `Duplex` stream) unless fd `0` refers to a file, in which case it is
     * a `Readable` stream.
     *
     * For details of how to read from `stdin` see `readable.read()`.
     *
     * As a `Duplex` stream, `process.stdin` can also be used in "old" mode that
     * is compatible with scripts written for Node.js prior to v0.10\.
     * For more information see `Stream compatibility`.
     *
     * In "old" streams mode the `stdin` stream is paused by default, so one
     * must call `process.stdin.resume()` to read from it. Note also that calling `process.stdin.resume()` itself would switch stream to "old" mode.
     */
    stdin: ReadStream & {
        fd: 0;
    };
    /**
     * The `process.argv` property returns an array containing the command-line
     * arguments passed when the Node.js process was launched. The first element will
     * be {@link execPath}. See `process.argv0` if access to the original value
     * of `argv[0]` is needed. The second element will be the path to the JavaScript
     * file being executed. If a [program entry point](https://nodejs.org/docs/latest-v26.x/api/cli.html#program-entry-point) was provided, the second element
     * will be the absolute path to it. The remaining elements are additional command-line
     * arguments.
     *
     * For example, assuming the following script for `process-args.js`:
     *
     * ```js
     * import { argv } from 'node:process';
     *
     * // print process.argv
     * argv.forEach((val, index) => {
     *   console.log(`${index}: ${val}`);
     * });
     * ```
     *
     * Launching the Node.js process as:
     *
     * ```bash
     * node process-args.js one two=three four
     * ```
     *
     * Would generate the output:
     *
     * ```text
     * 0: /usr/local/bin/node
     * 1: /Users/mjr/work/node/process-args.js
     * 2: one
     * 3: two=three
     * 4: four
     * ```
     * @since v0.1.27
     */
    argv: string[];
    /**
     * The `process.argv0` property stores a read-only copy of the original value of`argv[0]` passed when Node.js starts.
     *
     * ```console
     * $ bash -c 'exec -a customArgv0 ./node'
     * > process.argv[0]
     * '/Volumes/code/external/node/out/Release/node'
     * > process.argv0
     * 'customArgv0'
     * ```
     * @since v6.4.0
     */
    argv0: string;
    /**
     * The `process.execArgv` property returns the set of Node.js-specific command-line
     * options passed when the Node.js process was launched. These options do not
     * appear in the array returned by the {@link argv} property, and do not
     * include the Node.js executable, the name of the script, or any options following
     * the script name. These options are useful in order to spawn child processes with
     * the same execution environment as the parent.
     *
     * ```bash
     * node --icu-data-dir=./foo --require ./bar.js script.js --version
     * ```
     *
     * Results in `process.execArgv`:
     *
     * ```json
     * ["--icu-data-dir=./foo", "--require", "./bar.js"]
     * ```
     *
     * And `process.argv`:
     *
     * ```json
     * ["/usr/local/bin/node", "script.js", "--version"]
     * ```
     *
     * Refer to `Worker constructor` for the detailed behavior of worker
     * threads with this property.
     * @since v0.7.7
     */
    execArgv: string[];
    /**
     * The `process.execPath` property returns the absolute pathname of the executable
     * that started the Node.js process. Symbolic links, if any, are resolved.
     *
     * ```json
     * "/usr/local/bin/node"
     * ```
     * @since v0.1.100
     */
    execPath: string;
    /**
     * The port used by the Node.js debugger when enabled.
     *
     * ```js
     * import process from 'node:process';
     *
     * process.debugPort = 5858;
     * ```
     * @since v0.7.2
     */
    debugPort: number;
    /**
     * The `process.env` property returns an object containing the user environment.
     * See [`environ(7)`](http://man7.org/linux/man-pages/man7/environ.7.html).
     *
     * An example of this object looks like:
     *
     * ```json
     * {
     *   "TERM": "xterm-256color",
     *   "SHELL": "/usr/local/bin/bash",
     *   "USER": "maciej",
     *   "PATH": "~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin",
     *   "PWD": "/Users/maciej",
     *   "EDITOR": "vim",
     *   "SHLVL": "1",
     *   "HOME": "/Users/maciej",
     *   "LOGNAME": "maciej",
     *   "_": "/usr/local/bin/node"
     * }
     * ```
     *
     * It is possible to modify this object, but such modifications will not be
     * reflected outside the Node.js process, or (unless explicitly requested)
     * to other `Worker` threads.
     * In other words, the following example would not work:
     *
     * ```bash
     * node -e 'process.env.foo = "bar"' &#x26;&#x26; echo $foo
     * ```
     *
     * While the following will:
     *
     * ```js
     * import { env } from 'node:process';
     *
     * env.foo = 'bar';
     * console.log(env.foo);
     * ```
     *
     * Assigning a property on `process.env` will implicitly convert the value
     * to a string. **This behavior is deprecated.** Future versions of Node.js may
     * throw an error when the value is not a string, number, or boolean.
     *
     * ```js
     * import { env } from 'node:process';
     *
     * env.test = null;
     * console.log(env.test);
     * // => 'null'
     * env.test = undefined;
     * console.log(env.test);
     * // => 'undefined'
     * ```
     *
     * Use `delete` to delete a property from `process.env`.
     *
     * ```js
     * import { env } from 'node:process';
     *
     * env.TEST = 1;
     * delete env.TEST;
     * console.log(env.TEST);
     * // => undefined
     * ```
     *
     * On Windows operating systems, environment variables are case-insensitive.
     *
     * ```js
     * import { env } from 'node:process';
     *
     * env.TEST = 1;
     * console.log(env.test);
     * // => 1
     * ```
     *
     * Unless explicitly specified when creating a `Worker` instance,
     * each `Worker` thread has its own copy of `process.env`, based on its
     * parent thread's `process.env`, or whatever was specified as the `env` option
     * to the `Worker` constructor. Changes to `process.env` will not be visible
     * across `Worker` threads, and only the main thread can make changes that
     * are visible to the operating system or to native add-ons. On Windows, a copy of `process.env` on a `Worker` instance operates in a case-sensitive manner
     * unlike the main thread.
     * @since v0.1.27
     */
    env: ProcessEnv;
    /**
     * A number which will be the process exit code, when the process either
     * exits gracefully, or is exited via {@link exit} without specifying
     * a code.
     *
     * Specifying a code to {@link exit} will override any
     * previous setting of `process.exitCode`.
     * @default undefined
     * @since v0.11.8
     */
    exitCode: number | string | null | undefined;
    finalization: {
        /**
         * This function registers a callback to be called when the process emits the `exit` event if the `ref` object was not garbage collected.
         * If the object `ref` was garbage collected before the `exit` event is emitted, the callback will be removed from the finalization registry, and it will not be called on process exit.
         *
         * Inside the callback you can release the resources allocated by the `ref` object.
         * Be aware that all limitations applied to the `beforeExit` event are also applied to the callback function,
         * this means that there is a possibility that the callback will not be called under special circumstances.
         *
         * The idea of ​​this function is to help you free up resources when the starts process exiting, but also let the object be garbage collected if it is no longer being used.
         * @param ref The reference to the resource that is being tracked.
         * @param callback The callback function to be called when the resource is finalized.
         * @since v22.5.0
         * @experimental
         */
        register<T extends object>(ref: T, callback: (ref: T, event: "exit") => void): void;
        /**
         * This function behaves exactly like the `register`, except that the callback will be called when the process emits the `beforeExit` event if `ref` object was not garbage collected.
         *
         * Be aware that all limitations applied to the `beforeExit` event are also applied to the callback function, this means that there is a possibility that the callback will not be called under special circumstances.
         * @param ref The reference to the resource that is being tracked.
         * @param callback The callback function to be called when the resource is finalized.
         * @since v22.5.0
         * @experimental
         */
        registerBeforeExit<T extends object>(ref: T, callback: (ref: T, event: "beforeExit") => void): void;
        /**
         * This function remove the register of the object from the finalization registry, so the callback will not be called anymore.
         * @param ref The reference to the resource that was registered previously.
         * @since v22.5.0
         * @experimental
         */
        unregister(ref: object): void;
    };
    /**
     * The `process.getgid()` method returns the numerical group identity of the
     * process. (See [`getgid(2)`](http://man7.org/linux/man-pages/man2/getgid.2.html).)
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getgid) {
     *   console.log(`Current gid: ${process.getgid()}`);
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * @since v0.1.31
     */
    getgid?: () => number;
    /**
     * The `process.setgid()` method sets the group identity of the process. (See [`setgid(2)`](http://man7.org/linux/man-pages/man2/setgid.2.html).) The `id` can be passed as either a
     * numeric ID or a group name
     * string. If a group name is specified, this method blocks while resolving the
     * associated numeric ID.
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getgid &#x26;&#x26; process.setgid) {
     *   console.log(`Current gid: ${process.getgid()}`);
     *   try {
     *     process.setgid(501);
     *     console.log(`New gid: ${process.getgid()}`);
     *   } catch (err) {
     *     console.log(`Failed to set gid: ${err}`);
     *   }
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * This feature is not available in `Worker` threads.
     * @since v0.1.31
     * @param id The group name or ID
     */
    setgid?: (id: number | string) => void;
    /**
     * The `process.getuid()` method returns the numeric user identity of the process.
     * (See [`getuid(2)`](http://man7.org/linux/man-pages/man2/getuid.2.html).)
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getuid) {
     *   console.log(`Current uid: ${process.getuid()}`);
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * @since v0.1.28
     */
    getuid?: () => number;
    /**
     * The `process.setuid(id)` method sets the user identity of the process. (See [`setuid(2)`](http://man7.org/linux/man-pages/man2/setuid.2.html).) The `id` can be passed as either a
     * numeric ID or a username string.
     * If a username is specified, the method blocks while resolving the associated
     * numeric ID.
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getuid &#x26;&#x26; process.setuid) {
     *   console.log(`Current uid: ${process.getuid()}`);
     *   try {
     *     process.setuid(501);
     *     console.log(`New uid: ${process.getuid()}`);
     *   } catch (err) {
     *     console.log(`Failed to set uid: ${err}`);
     *   }
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * This feature is not available in `Worker` threads.
     * @since v0.1.28
     */
    setuid?: (id: number | string) => void;
    /**
     * The `process.geteuid()` method returns the numerical effective user identity of
     * the process. (See [`geteuid(2)`](http://man7.org/linux/man-pages/man2/geteuid.2.html).)
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.geteuid) {
     *   console.log(`Current uid: ${process.geteuid()}`);
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * @since v2.0.0
     */
    geteuid?: () => number;
    /**
     * The `process.seteuid()` method sets the effective user identity of the process.
     * (See [`seteuid(2)`](http://man7.org/linux/man-pages/man2/seteuid.2.html).) The `id` can be passed as either a numeric ID or a username
     * string. If a username is specified, the method blocks while resolving the
     * associated numeric ID.
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.geteuid &#x26;&#x26; process.seteuid) {
     *   console.log(`Current uid: ${process.geteuid()}`);
     *   try {
     *     process.seteuid(501);
     *     console.log(`New uid: ${process.geteuid()}`);
     *   } catch (err) {
     *     console.log(`Failed to set uid: ${err}`);
     *   }
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * This feature is not available in `Worker` threads.
     * @since v2.0.0
     * @param id A user name or ID
     */
    seteuid?: (id: number | string) => void;
    /**
     * The `process.getegid()` method returns the numerical effective group identity
     * of the Node.js process. (See [`getegid(2)`](http://man7.org/linux/man-pages/man2/getegid.2.html).)
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getegid) {
     *   console.log(`Current gid: ${process.getegid()}`);
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * @since v2.0.0
     */
    getegid?: () => number;
    /**
     * The `process.setegid()` method sets the effective group identity of the process.
     * (See [`setegid(2)`](http://man7.org/linux/man-pages/man2/setegid.2.html).) The `id` can be passed as either a numeric ID or a group
     * name string. If a group name is specified, this method blocks while resolving
     * the associated a numeric ID.
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getegid &#x26;&#x26; process.setegid) {
     *   console.log(`Current gid: ${process.getegid()}`);
     *   try {
     *     process.setegid(501);
     *     console.log(`New gid: ${process.getegid()}`);
     *   } catch (err) {
     *     console.log(`Failed to set gid: ${err}`);
     *   }
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * This feature is not available in `Worker` threads.
     * @since v2.0.0
     * @param id A group name or ID
     */
    setegid?: (id: number | string) => void;
    /**
     * The `process.getgroups()` method returns an array with the supplementary group
     * IDs. POSIX leaves it unspecified if the effective group ID is included but
     * Node.js ensures it always is.
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getgroups) {
     *   console.log(process.getgroups()); // [ 16, 21, 297 ]
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * @since v0.9.4
     */
    getgroups?: () => number[];
    /**
     * The `process.setgroups()` method sets the supplementary group IDs for the
     * Node.js process. This is a privileged operation that requires the Node.js
     * process to have `root` or the `CAP_SETGID` capability.
     *
     * The `groups` array can contain numeric group IDs, group names, or both.
     *
     * ```js
     * import process from 'node:process';
     *
     * if (process.getgroups &#x26;&#x26; process.setgroups) {
     *   try {
     *     process.setgroups([501]);
     *     console.log(process.getgroups()); // new groups
     *   } catch (err) {
     *     console.log(`Failed to set groups: ${err}`);
     *   }
     * }
     * ```
     *
     * This function is only available on POSIX platforms (i.e. not Windows or
     * Android).
     * This feature is not available in `Worker` threads.
     * @since v0.9.4
     */
    setgroups?: SetGroups;
    /**
     * The `process.sourceMapsEnabled` property returns whether the [Source Map v3](https://sourcemaps.info/spec.html) support for stack traces is enabled.
     * @since v20.7.0
     * @experimental
     */
    readonly sourceMapsEnabled: boolean;
    /**
     * The `process.version` property contains the Node.js version string.
     *
     * ```js
     * import { version } from 'node:process';
     *
     * console.log(`Version: ${version}`);
     * // Version: v14.8.0
     * ```
     *
     * To get the version string without the prepended _v_, use`process.versions.node`.
     * @since v0.1.3
     */
    readonly version: string;
    /**
     * The `process.versions` property returns an object listing the version strings of
     * Node.js and its dependencies. `process.versions.modules` indicates the current
     * ABI version, which is increased whenever a C++ API changes. Node.js will refuse
     * to load modules that were compiled against a different module ABI version.
     *
     * ```js
     * import { versions } from 'node:process';
     *
     * console.log(versions);
     * ```
     *
     * Will generate an object similar to:
     *
     * ```console
     * { node: '26.0.0-pre',
     *   acorn: '8.15.0',
     *   ada: '3.4.1',
     *   amaro: '1.1.5',
     *   ares: '1.34.6',
     *   brotli: '1.2.0',
     *   merve: '1.0.0',
     *   cldr: '48.0',
     *   icu: '78.2',
     *   llhttp: '9.3.0',
     *   modules: '144',
     *   napi: '10',
     *   nbytes: '0.1.1',
     *   ncrypto: '0.0.1',
     *   nghttp2: '1.68.0',
     *   nghttp3: '',
     *   ngtcp2: '',
     *   openssl: '3.5.4',
     *   simdjson: '4.2.4',
     *   simdutf: '7.3.3',
     *   sqlite: '3.51.2',
     *   tz: '2025c',
     *   undici: '7.18.2',
     *   unicode: '17.0',
     *   uv: '1.51.0',
     *   uvwasi: '0.0.23',
     *   v8: '14.3.127.18-node.10',
     *   zlib: '1.3.1-e00f703',
     *   zstd: '1.5.7' }
     * ```
     * @since v0.2.0
     */
    readonly versions: ProcessVersions;
    /**
     * The `process.config` property returns a frozen `Object` containing the
     * JavaScript representation of the configure options used to compile the current
     * Node.js executable. This is the same as the `config.gypi` file that was produced
     * when running the `./configure` script.
     *
     * An example of the possible output looks like:
     *
     * ```json
     * {
     *   "target_defaults":
     *    { "cflags": [],
     *      "default_configuration": "Release",
     *      "defines": [],
     *      "include_dirs": [],
     *      "libraries": [] },
     *   "variables":
     *    {
     *      "host_arch": "x64",
     *      "napi_build_version": 5,
     *      "node_install_npm": "true",
     *      "node_prefix": "",
     *      "node_shared_cares": "false",
     *      "node_shared_http_parser": "false",
     *      "node_shared_libuv": "false",
     *      "node_shared_zlib": "false",
     *      "node_use_openssl": "true",
     *      "node_shared_openssl": "false",
     *      "target_arch": "x64",
     *      "v8_use_snapshot": 1
     *    }
     * }
     * ```
     * @since v0.7.7
     */
    readonly config: ProcessConfig;
    /**
     * The `process.pid` property returns the PID of the process.
     *
     * ```js
     * import { pid } from 'node:process';
     *
     * console.log(`This process is pid ${pid}`);
     * ```
     * @since v0.1.15
     */
    readonly pid: number;
    /**
     * The `process.ppid` property returns the PID of the parent of the
     * current process.
     *
     * ```js
     * import { ppid } from 'node:process';
     *
     * console.log(`The parent process is pid ${ppid}`);
     * ```
     * @since v9.2.0, v8.10.0, v6.13.0
     */
    readonly ppid: number;
    /**
     * The `process.title` property returns the current process title (i.e. returns
     * the current value of `ps`). Assigning a new value to `process.title` modifies
     * the current value of `ps`.
     *
     * When a new value is assigned, different platforms will impose different maximum
     * length restrictions on the title. Usually such restrictions are quite limited.
     * For instance, on Linux and macOS, `process.title` is limited to the size of the
     * binary name plus the length of the command-line arguments because setting the `process.title` overwrites the `argv` memory of the process. Node.js v0.8
     * allowed for longer process title strings by also overwriting the `environ` memory but that was potentially insecure and confusing in some (rather obscure)
     * cases.
     *
     * Assigning a value to `process.title` might not result in an accurate label
     * within process manager applications such as macOS Activity Monitor or Windows
     * Services Manager.
     * @since v0.1.104
     */
    title: string;
    /**
     * The operating system CPU architecture for which the Node.js binary was compiled.
     * Possible values are: `'arm'`, `'arm64'`, `'ia32'`, `'loong64'`, `'mips'`,
     * `'mipsel'`, `'ppc64'`, `'riscv64'`, `'s390x'`, and `'x64'`.
     *
     * ```js
     * import { arch } from 'node:process';
     *
     * console.log(`This processor architecture is ${arch}`);
     * ```
     * @since v0.5.0
     */
    readonly arch: Architecture;
    /**
     * The `process.platform` property returns a string identifying the operating
     * system platform for which the Node.js binary was compiled.
     *
     * Currently possible values are:
     *
     * * `'aix'`
     * * `'darwin'`
     * * `'freebsd'`
     * * `'linux'`
     * * `'openbsd'`
     * * `'sunos'`
     * * `'win32'`
     *
     * ```js
     * import { platform } from 'node:process';
     *
     * console.log(`This platform is ${platform}`);
     * ```
     *
     * The value `'android'` may also be returned if the Node.js is built on the
     * Android operating system. However, Android support in Node.js [is experimental](https://github.com/nodejs/node/blob/HEAD/BUILDING.md#androidandroid-based-devices-eg-firefox-os).
     * @since v0.1.16
     */
    readonly platform: Platform;
    /**
     * The `process.mainModule` property provides an alternative way of retrieving `require.main`. The difference is that if the main module changes at
     * runtime, `require.main` may still refer to the original main module in
     * modules that were required before the change occurred. Generally, it's
     * safe to assume that the two refer to the same module.
     *
     * As with `require.main`, `process.mainModule` will be `undefined` if there
     * is no entry script.
     * @since v0.1.17
     * @deprecated Since v14.0.0 - Use `main` instead.
     */
    mainModule?: Module;
    memoryUsage: MemoryUsageFn;
    /**
     * The process.noDeprecation property indicates whether the --no-deprecation flag is set on the current Node.js process.
     * See the documentation for the ['warning' event](https://nodejs.org/docs/latest/api/process.html#event-warning) and the [emitWarning()](https://nodejs.org/docs/latest/api/process.html#processemitwarningwarning-type-code-ctor) method for more information about this flag's behavior.
     */
    noDeprecation?: boolean;
    /**
     * This API is available through the [--permission](https://nodejs.org/api/cli.html#--permission) flag.
     *
     * `process.permission` is an object whose methods are used to manage permissions for the current process.
     * Additional documentation is available in the [Permission Model](https://nodejs.org/api/permissions.html#permission-model).
     * @since v20.0.0
     */
    permission: ProcessPermission;
    /**
     * The `process.release` property returns an `Object` containing metadata related
     * to the current release, including URLs for the source tarball and headers-only
     * tarball.
     *
     * `process.release` contains the following properties:
     *
     * ```json
     * {
     *   "name": "node",
     *   "lts": "Hydrogen",
     *   "sourceUrl": "https://nodejs.org/download/release/v18.12.0/node-v18.12.0.tar.gz",
     *   "headersUrl": "https://nodejs.org/download/release/v18.12.0/node-v18.12.0-headers.tar.gz",
     *   "libUrl": "https://nodejs.org/download/release/v18.12.0/win-x64/node.lib"
     * }
     * ```
     *
     * In custom builds from non-release versions of the source tree, only the `name` property may be present. The additional properties should not be
     * relied upon to exist.
     * @since v3.0.0
     */
    readonly release: ProcessRelease;
    readonly features: ProcessFeatures;
    /**
     * The `process.traceProcessWarnings` property indicates whether the `--trace-warnings` flag
     * is set on the current Node.js process. This property allows programmatic control over the
     * tracing of warnings, enabling or disabling stack traces for warnings at runtime.
     *
     * ```js
     * // Enable trace warnings
     * process.traceProcessWarnings = true;
     *
     * // Emit a warning with a stack trace
     * process.emitWarning('Warning with stack trace');
     *
     * // Disable trace warnings
     * process.traceProcessWarnings = false;
     * ```
     * @since v6.10.0
     */
    traceProcessWarnings: boolean;
    hrtime: HRTime;
    /**
     * If the Node.js process was spawned with an IPC channel, the process.channel property is a reference to the IPC channel.
     * If no IPC channel exists, this property is undefined.
     * @since v7.1.0
     */
    channel?: Channel;
    /**
     * If the Node.js process is spawned with an IPC channel (see the `Child Process` and `Cluster` documentation), the `process.connected` property will return `true` so long as the IPC
     * channel is connected and will return `false` after `process.disconnect()` is called.
     *
     * Once `process.connected` is `false`, it is no longer possible to send messages
     * over the IPC channel using `process.send()`.
     * @since v0.7.2
     */
    connected: boolean;
    /**
     * The `process.allowedNodeEnvironmentFlags` property is a special,
     * read-only `Set` of flags allowable within the `NODE_OPTIONS` environment variable.
     *
     * `process.allowedNodeEnvironmentFlags` extends `Set`, but overrides `Set.prototype.has` to recognize several different possible flag
     * representations. `process.allowedNodeEnvironmentFlags.has()` will
     * return `true` in the following cases:
     *
     * * Flags may omit leading single (`-`) or double (`--`) dashes; e.g., `inspect-brk` for `--inspect-brk`, or `r` for `-r`.
     * * Flags passed through to V8 (as listed in `--v8-options`) may replace
     * one or more _non-leading_ dashes for an underscore, or vice-versa;
     * e.g., `--perf_basic_prof`, `--perf-basic-prof`, `--perf_basic-prof`,
     * etc.
     * * Flags may contain one or more equals (`=`) characters; all
     * characters after and including the first equals will be ignored;
     * e.g., `--stack-trace-limit=100`.
     * * Flags _must_ be allowable within `NODE_OPTIONS`.
     *
     * When iterating over `process.allowedNodeEnvironmentFlags`, flags will
     * appear only _once_; each will begin with one or more dashes. Flags
     * passed through to V8 will contain underscores instead of non-leading
     * dashes:
     *
     * ```js
     * import { allowedNodeEnvironmentFlags } from 'node:process';
     *
     * allowedNodeEnvironmentFlags.forEach((flag) => {
     *   // -r
     *   // --inspect-brk
     *   // --abort_on_uncaught_exception
     *   // ...
     * });
     * ```
     *
     * The methods `add()`, `clear()`, and `delete()` of`process.allowedNodeEnvironmentFlags` do nothing, and will fail
     * silently.
     *
     * If Node.js was compiled _without_ `NODE_OPTIONS` support (shown in {@link config}), `process.allowedNodeEnvironmentFlags` will
     * contain what _would have_ been allowable.
     * @since v10.10.0
     */
    allowedNodeEnvironmentFlags: EnvironmentFlags;
    /**
     * `process.report` is an object whose methods are used to generate diagnostic reports for the current process.
     * Additional documentation is available in the [report documentation](https://nodejs.org/docs/latest-v26.x/api/report.html).
     * @since v11.8.0
     */
    report: ProcessReport;
    /**
     * The initial value of `process.throwDeprecation` indicates whether the `--throw-deprecation` flag is set on the current Node.js process. `process.throwDeprecation`
     * is mutable, so whether or not deprecation warnings result in errors may be altered at runtime. See the documentation for the 'warning' event and the emitWarning()
     * method for more information.
     *
     * ```bash
     * $ node --throw-deprecation -p "process.throwDeprecation"
     * true
     * $ node -p "process.throwDeprecation"
     * undefined
     * $ node
     * > process.emitWarning('test', 'DeprecationWarning');
     * undefined
     * > (node:26598) DeprecationWarning: test
     * > process.throwDeprecation = true;
     * true
     * > process.emitWarning('test', 'DeprecationWarning');
     * Thrown:
     * [DeprecationWarning: test] { name: 'DeprecationWarning' }
     * ```
     * @since v0.9.12
     */
    throwDeprecation: boolean;
    /**
     * The `process.traceDeprecation` property indicates whether the `--trace-deprecation` flag is set on the current Node.js process. See the
     * documentation for the `'warning' event` and the `emitWarning() method` for more information about this
     * flag's behavior.
     * @since v0.8.0
     */
    traceDeprecation: boolean;
}
