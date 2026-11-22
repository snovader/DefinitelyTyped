export {};

declare global {
    namespace NodeJS {
        interface Process {
            kill(pid: number): "peer";
            cwd(): "/peer";
        }
    }
}
