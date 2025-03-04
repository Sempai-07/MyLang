"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinModules = void 0;
exports.isBuildInModule = isBuildInModule;
exports.loadJSONModule = loadJSONModule;
exports.loadHTTPModule = loadHTTPModule;
exports.loadBuildInModule = loadBuildInModule;
exports.loadFileModule = loadFileModule;
exports.loadPackageModule = loadPackageModule;
const ImportDeclaration_1 = require("../../../ast/declaration/ImportDeclaration");
const builtinModules = ImportDeclaration_1.ImportDeclaration.buildInLibs;
exports.builtinModules = builtinModules;
const importPrototype = Object.create(ImportDeclaration_1.ImportDeclaration.prototype);
function isBuildInModule([libname]) {
    return builtinModules.indexOf(libname) !== -1;
}
function loadJSONModule([filepath, nameToAddScore], score) {
    return importPrototype.handleModuleImport.call(ImportDeclaration_1.ImportDeclaration, importPrototype.resolveJSONModule.call(ImportDeclaration_1.ImportDeclaration, filepath, score), nameToAddScore ? nameToAddScore : "nil", nameToAddScore ? score : score.clone());
}
function loadHTTPModule([url, nameToAddScore], score) {
    return importPrototype.handleModuleImport.call(ImportDeclaration_1.ImportDeclaration, importPrototype.resolveHTTPModule.call(ImportDeclaration_1.ImportDeclaration, url, score), nameToAddScore ? nameToAddScore : "nil", nameToAddScore ? score : score.clone());
}
function loadBuildInModule([libname, nameToAddScore], score) {
    return importPrototype.handleModuleImport.call(ImportDeclaration_1.ImportDeclaration, importPrototype.resolveBuildInModule.call(ImportDeclaration_1.ImportDeclaration, libname, score), nameToAddScore ? nameToAddScore : "nil", nameToAddScore ? score : score.clone());
}
function loadFileModule([filepath, nameToAddScore], score) {
    return importPrototype.handleModuleImport.call(ImportDeclaration_1.ImportDeclaration, importPrototype.resolveFileModule.call(ImportDeclaration_1.ImportDeclaration, filepath, score), nameToAddScore ? nameToAddScore : "nil", nameToAddScore ? score : score.clone());
}
function loadPackageModule([packageName, nameToAddScore], score) {
    return importPrototype.handleModuleImport.call(ImportDeclaration_1.ImportDeclaration, importPrototype.resolvePackageModule.call(ImportDeclaration_1.ImportDeclaration, packageName, score), nameToAddScore ? nameToAddScore : "nil", nameToAddScore ? score : score.clone());
}
