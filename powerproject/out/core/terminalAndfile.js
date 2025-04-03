"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalAndfile = terminalAndfile;
const vscode = __importStar(require("vscode"));
const terminalservice_1 = require("./terminalservice");
const handler_1 = require("../api/handler");
const index_1 = require("../api/index");
const utils_1 = require("../api/utils");
async function terminalAndfile() {
    // 获取最后一条命令历史
    const lastHistory = terminalservice_1.TerminalService.getLastCommandHistory();
    if (!lastHistory) {
        vscode.window.showErrorMessage('未找到最后的命令历史记录');
        return;
    }
    // 获取当前打开的文件中的代码
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('当前没有打开的文件');
        return;
    }
    const document = editor.document;
    const code = document.getText();
    const config = vscode.workspace.getConfiguration('powerproject');
    const api_config = {
        apiProvider: config.get('apiProvider'),
        apiKey: config.get('apiKey'),
        anthropicBaseUrl: config.get('baseURL'),
        openAiBaseUrl: config.get('baseURL'),
        openAiApiKey: config.get('apiKey'),
        openAiModelId: config.get('modelId'),
    };
    const api_handler = (0, index_1.buildApiHandler)(api_config);
    // 拼接提示信息，包含代码与错误信息
    const prompt = `请根据以下代码和错误信息修复代码：
        
        代码:
        ${code}

        错误信息:
        ${lastHistory.output}

        修复后的代码:`;
    let task = "modifycode_terminalandfile";
    const { systemPrompt, messageParams } = (0, utils_1.genPrompt)(task, prompt);
    const fullText = await (0, handler_1.generateCode)(systemPrompt, messageParams, api_handler);
    const fixedCode = (0, utils_1.extractCode)(fullText);
    // 在新的文件中显示改错后的代码
    // 替换当前文件内容
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(code.length));
    editor.edit(editBuilder => {
        editBuilder.replace(fullRange, fixedCode);
    }).then(success => {
        if (success) {
            vscode.window.showInformationMessage('代码已成功替换为改错后的版本');
        }
        else {
            vscode.window.showErrorMessage('替换代码失败');
        }
    });
}
//# sourceMappingURL=terminalAndfile.js.map