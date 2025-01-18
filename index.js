const fs = require("node:fs");
const path = require("node:path");
const { run } = require("./dist/src/utils/utils");

const { base } = path.parse(process.cwd());

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

try {
  run(fs.readFileSync("index.ml").toString(), {
    base: process.cwd(),
    main: path.join(process.cwd(), "./index.ml"),
  });
} catch (err) {
  console.log(err);
}
