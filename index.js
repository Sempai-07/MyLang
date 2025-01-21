const fs = require("node:fs");
const path = require("node:path");
const { run } = require("./dist/src/utils/utils");

const { base } = path.parse(process.cwd());

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

try {
  fs.readdirSync("./examples/").forEach((value) => {
    if (!value.endsWith(".ml")) return;

    run(
      fs.readFileSync(path.join(process.cwd(), "/examples/", value)).toString(),
      {
        base: process.cwd(),
        main: path.join(process.cwd(), "/examples/", value),
      },
    );
  });
} catch (err) {
  console.log(err);
}
