/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  transform: {
    // the page is built as ES modules by Vite; jest runs the same sources as CommonJS
    "^.+\\.ts$": [
      "ts-jest",
      { tsconfig: { module: "commonjs", moduleResolution: "node" } },
    ],
  },
};
