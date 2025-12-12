const path = require("path");

const SRC_DIR = path.resolve(__dirname, "src");
const DIST_DIR = path.resolve(__dirname, "dist");

const sharedResolve = {
    alias: {
        "@": SRC_DIR,
    },
    // Explicitly resolve files with following extension as modules.
    extensions: [".js", ".jsx", ".ts", ".tsx"],
};

const sharedModuleRules = [
    {
        test: /\.(js|jsx)$/,
        include: SRC_DIR,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                presets: ["@babel/preset-react"],
            },
        },
    },
    {
        test: /\.(ts|tsx)$/,
        include: SRC_DIR,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                presets: ["@babel/preset-typescript", "@babel/preset-react"],
            },
        },
    },
];

function createProcessConfig({ target, entry, filename, libraryType, experiments, chunkFormat }) {
    const config = {
        resolve: sharedResolve,
        target,
        entry,
        output: {
            path: DIST_DIR,
            filename,
        },
        module: {
            rules: sharedModuleRules,
        },
    };

    if (experiments) {
        config.experiments = experiments;
    }
    if (libraryType) {
        config.output.library = { type: libraryType };
    }
    if (chunkFormat) {
        config.output.chunkFormat = chunkFormat;
    }

    return config;
}

const rendererProcessConfig = createProcessConfig({
    target: "electron-renderer",
    entry: "./src/renderer.tsx",
    filename: "renderer.js",
    libraryType: "module", // necessary in order to work with liteloader.
    experiments: { outputModule: true },
});

const mainProcessConfig = createProcessConfig({
    target: "electron-main",
    entry: "./src/main.ts",
    filename: "main.js",
    libraryType: "commonjs-static", // necessary in order to work with liteloader.
    chunkFormat: "module",
});

const preloadProcessConfig = createProcessConfig({
    target: "electron-preload",
    entry: "./src/preload.ts",
    filename: "preload.js",
});

module.exports = [rendererProcessConfig, mainProcessConfig, preloadProcessConfig];