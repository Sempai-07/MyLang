const version = "1.0.0";
const arch = process.arch;
const platform = process.platform;

const node = {
  version: process.version,
  versions: process.versions,
  release: process.release,
  env: process.env,
};

export { version, arch, platform, node };
