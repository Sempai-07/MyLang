"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumDeclaration = void 0;
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const BaseError_1 = require("../../errors/BaseError");
class EnumDeclaration extends StmtType_1.StmtType {
    name;
    identifierList;
    functionsList;
    position;
    constructor(name, identifierList, functionsList, position) {
        super();
        this.name = name;
        this.identifierList = identifierList;
        this.functionsList = functionsList;
        this.position = position;
    }
    evaluate(score) {
        try {
            score.create(this.name, {});
            const enumEnvironment = new Environment_1.Environment(score);
            let step = 1;
            let startIndex = 0;
            for (let i = 0; i < this.identifierList.length; i++) {
                const { value } = this.identifierList[i];
                if (value) {
                    const evaluatedValue = value.evaluate(enumEnvironment);
                    if (typeof evaluatedValue === "number") {
                        startIndex = evaluatedValue;
                        if (i + 1 < this.identifierList.length) {
                            const nextValue = this.identifierList[i + 1]?.value;
                            if (nextValue) {
                                const nextEvaluatedValue = nextValue.evaluate(enumEnvironment);
                                if (typeof nextEvaluatedValue === "number") {
                                    step = nextEvaluatedValue - startIndex;
                                }
                            }
                        }
                        break;
                    }
                }
            }
            let currentIndex = startIndex;
            this.identifierList.forEach(({ name, value }) => {
                if (value) {
                    const fieldValue = value.evaluate(enumEnvironment);
                    enumEnvironment.update(this.name, {
                        ...enumEnvironment.get(this.name),
                        [String(fieldValue) === "[object Object]"
                            ? currentIndex
                            : String(fieldValue)]: name.value,
                        [name.value]: fieldValue,
                    });
                }
                else {
                    enumEnvironment.update(this.name, {
                        ...enumEnvironment.get(this.name),
                        [currentIndex]: name.value,
                        [name.value]: currentIndex,
                    });
                }
                currentIndex += step;
            });
            this.functionsList.forEach((func) => {
                enumEnvironment.update(this.name, {
                    ...enumEnvironment.get(this.name),
                    [func.name]: func.evaluate(enumEnvironment),
                });
            });
            const enumData = {
                ...enumEnvironment.get(this.name),
                *[Symbol.iterator]() {
                    for (const [key, value] of Object.entries(enumEnvironment.get(this.name))) {
                        yield [key, value];
                    }
                },
            };
            Object.defineProperty(enumData, Environment_1.Environment.SymbolEnum, {
                value: true,
                enumerable: false,
            });
            score.update(this.name, enumData);
            return enumData;
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `${this.name} (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.EnumDeclaration = EnumDeclaration;
