"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsDeclaration = void 0;
const StmtType_1 = require("../StmtType");
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
            score.update("#exports", {
                ...score.get("#exports"),
                [key]: this.value[key].evaluate(score),
            });
        }
        return null;
    }
}
exports.ExportsDeclaration = ExportsDeclaration;
