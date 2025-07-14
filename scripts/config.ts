import e from "esbuild";

export const config: e.BuildOptions = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "out/extension.cjs",
    platform: "node",
    target: "node12",
    sourcemap: false,
    minify: true,
    external: ["vscode"],
    format: "cjs",
    logLevel: "info",
}