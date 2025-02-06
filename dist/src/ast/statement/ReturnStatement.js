"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatement = void 0;
const StmtType_1 = require("../StmtType");
class ReturnStatement extends StmtType_1.StmtType {
    body;
    position;
    constructor(body, position) {
        super();
        this.body = body;
        this.position = position;
    }
    evaluate(score) {
        if (Array.isArray(this.body)) {
            return this.body.map((value) => value.evaluate(score));
        }
        if (!(this.body instanceof StmtType_1.StmtType)) {
            return this.body;
        }
        return this.body.evaluate(score);
    }
}
exports.ReturnStatement = ReturnStatement;
