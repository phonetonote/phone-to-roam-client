const fs = require("fs");
const path = require("path");

const extensions = fs.readdirSync("./src/entries/");
const entry = Object.fromEntries(
  extensions.map((e) => [e.substring(0, e.length - 3), `./src/entries/${e}`])
);

module.exports = {
  entry,
  resolve: {
    extensions: [".ts", ".js"],
  },
  mode: "production",
  output: {
    path: path.join(__dirname, "build"),
    filename: "extension.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            noEmit: false,
          },
        },
      },
    ],
  },
  performance: {
    hints: "warning",
    maxEntrypointSize: 280000,
    maxAssetSize: 280000,
  },
};
