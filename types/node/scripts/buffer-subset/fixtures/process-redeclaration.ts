/// <reference types="node" />
export {};

declare global {
    namespace NodeJS {
        interface Process {
            // @ts-expect-error A second declaration must have the original property's type.
            readonly pid: 1;
            // @ts-expect-error Optional function properties follow the same merge rule.
            getuid?: () => 1;
        }
    }
}
