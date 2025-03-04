import { ImportDeclaration } from "../../../ast/declaration/ImportDeclaration";

const builtinModules = ImportDeclaration.buildInLibs;

const importPrototype = Object.create(ImportDeclaration.prototype);

function isBuildInModule([libname]: [string]) {
  return builtinModules.indexOf(libname) !== -1;
}

function loadJSONModule(
  [filepath, nameToAddScore]: [string, string?],
  score: Record<string, any>,
) {
  return importPrototype.handleModuleImport.call(
    ImportDeclaration,
    importPrototype.resolveJSONModule.call(ImportDeclaration, filepath, score),
    nameToAddScore ? nameToAddScore : "nil",
    nameToAddScore ? score : score.clone(),
  );
}

function loadHTTPModule(
  [url, nameToAddScore]: [string, string?],
  score: Record<string, any>,
) {
  return importPrototype.handleModuleImport.call(
    ImportDeclaration,
    importPrototype.resolveHTTPModule.call(ImportDeclaration, url, score),
    nameToAddScore ? nameToAddScore : "nil",
    nameToAddScore ? score : score.clone(),
  );
}

function loadBuildInModule(
  [libname, nameToAddScore]: [string, string?],
  score: Record<string, any>,
) {
  return importPrototype.handleModuleImport.call(
    ImportDeclaration,
    importPrototype.resolveBuildInModule.call(
      ImportDeclaration,
      libname,
      score,
    ),
    nameToAddScore ? nameToAddScore : "nil",
    nameToAddScore ? score : score.clone(),
  );
}

function loadFileModule(
  [filepath, nameToAddScore]: [string, string?],
  score: Record<string, any>,
) {
  return importPrototype.handleModuleImport.call(
    ImportDeclaration,
    importPrototype.resolveFileModule.call(ImportDeclaration, filepath, score),
    nameToAddScore ? nameToAddScore : "nil",
    nameToAddScore ? score : score.clone(),
  );
}

function loadPackageModule(
  [packageName, nameToAddScore]: [string, string?],
  score: Record<string, any>,
) {
  return importPrototype.handleModuleImport.call(
    ImportDeclaration,
    importPrototype.resolvePackageModule.call(
      ImportDeclaration,
      packageName,
      score,
    ),
    nameToAddScore ? nameToAddScore : "nil",
    nameToAddScore ? score : score.clone(),
  );
}

export {
  builtinModules,
  isBuildInModule,
  loadJSONModule,
  loadHTTPModule,
  loadBuildInModule,
  loadFileModule,
  loadPackageModule,
};
