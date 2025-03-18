"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCodeForInsertion = formatCodeForInsertion;
exports.getTabulationOfTheLastLine = getTabulationOfTheLastLine;
const assert_1 = __importDefault(require("assert"));
function formatCodeForInsertion(code, codeBefore) {
    const codeLines = code.split('\n');
    if (codeLines.length <= 1) {
        return code;
    }
    const tabulation = getTabulationOfTheLastLine(codeBefore);
    const prefixedAllLinesButFirst = codeLines.map((l, i) => (i === 0 ? l : tabulation + l));
    return prefixedAllLinesButFirst.join('\n');
}
function getTabulationOfTheLastLine(code) {
    const lastLine = code.split('\n').pop();
    (0, assert_1.default)(lastLine !== undefined);
    const tabulation = lastLine.match(/^\s*/)?.[0];
    return tabulation ?? '';
}
//# sourceMappingURL=codeFormat.js.map