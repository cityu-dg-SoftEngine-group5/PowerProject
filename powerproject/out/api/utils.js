"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPrompt = genPrompt;
exports.extractCode = extractCode;
function genPrompt(taskType, userMessage, options) {
    // 设置默认值
    let systemprompt = "You are a helpful AI assistant.";
    let messageparams = [];
    switch (taskType) {
        case "completecode":
            systemprompt = "You are a helpful AI assistant that generates code. Complete the following code for me. Don't explain, just return the code. You should write the best replacement for placeholder {write code here} in the text. Include change line if needed.";
            messageparams = [{ role: "user", content: userMessage }];
            break;
        case "modifycode_terminalandfile":
            systemprompt = "You are a helpful AI assistant that modifies code. Modify the following code for me. Don't explain, just return the code.";
            messageparams = [{ role: "user", content: userMessage }];
            break;
    }
    return {
        systemPrompt: systemprompt,
        messageParams: messageparams,
    };
}
function extractCode(text) {
    const codeRegex = /```[^\n]*\r?\n([\s\S]*?)```/;
    const match = text.match(codeRegex);
    if (match && match[1]) {
        return match[1];
    }
    return text;
}
//# sourceMappingURL=utils.js.map