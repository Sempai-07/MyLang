"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSymbol = exports.ExportsDeclaration = void 0;
const StmtType_1 = require("../StmtType");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
const exportSymbol = Symbol("ExportSymbol");
exports.exportSymbol = exportSymbol;
class ExportsDeclaration extends StmtType_1.StmtType {
    position;
    value;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate(score) {
        for (const key of Object.keys(this.value)) {
            const expValue = this.value[key];
            score.update("#exports", {
                ...score.get("#exports"),
                [key]: {
                    value: expValue.evaluate(score),
                    ...(expValue instanceof IdentifierLiteral_1.IdentifierLiteral &&
                        score.optionsVar[expValue.value] && {
                        optionsVar: score.optionsVar[expValue.value],
                    }),
                    [exportSymbol]: true,
                },
            });
        }
        return null;
    }
}
exports.ExportsDeclaration = ExportsDeclaration;
