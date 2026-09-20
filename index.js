const fs = require("fs");
const path = require("path");
const { run } = require("./dist/src/utils/utils");

const mainFileDir = path.join(__dirname, "test");
const mainFilePath = path.join(__dirname, "test", "index.ml");
const mainFileContent = fs.readFileSync(mainFilePath, "utf-8");

(async () => {
  await run(mainFileContent, {
    main: mainFilePath,
    base: mainFileDir,
    onSuccess: (output) => {
      console.log("\nSuccessfully executed the main file. Output:", output);
    },
  });
})();
