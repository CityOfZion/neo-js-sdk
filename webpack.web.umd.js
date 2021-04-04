const path = require("path");

module.exports = function (mode, rootDir, pkgName) {
  return {
    name: "Web CJS",
    target: "web",
    output: {
      path: path.resolve(rootDir, "lib", "browser", "umd"),
      filename: "index.js",
      library: {
        type: "umd",
        name: pkgName,
      },
    },
    mode,
    devtool: mode === "development" ? "inline-source-map" : "source-map",
    entry: path.resolve(rootDir, "src", "index.ts"),
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"],
      fallback: {
        crypto: false,
        bufferutil: false,
        "utf-8-validate": false,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            projectReferences: true,
            context: rootDir,
            compilerOptions: {
              target: "es2015",
              lib: ["es2015"],
              sourceMap: mode === "development",
              module: "commonjs",
              outDir: path.resolve(rootDir, "lib", "browser", "cjs"),
            },
          },
        },
      ],
    },
  };
};
