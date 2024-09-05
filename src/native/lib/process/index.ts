import { parseArguments } from "../utils";

const version = "1.0.0";
const arch = process.arch;
const platform = process.platform;
// const on = function ([event, func], score) {
//   process.on(event, () => {
//     Object.assign(score, parseArguments(func, score, []));
//     func.body.evaluate(score);
//   });
// };

const node = {
  version: process.version,
  versions: process.versions,
  release: process.release,
  env: process.env,
};

export { version, arch, platform, node };
