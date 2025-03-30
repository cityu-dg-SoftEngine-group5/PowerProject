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
exports.makeSuggestion = makeSuggestion;
const vscode = __importStar(require("vscode"));
const handler_1 = require("../api/handler");
const codeFormat_1 = require("../utils/codeFormat");
const index_1 = require("../api/index");
const utils_1 = require("../api/utils");
async function makeSuggestion() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }
    const document = editor.document;
    const selection = editor.selection;
    const cursorPosition = selection.active;
    const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), cursorPosition));
    const textAfterCursor = document.getText(new vscode.Range(cursorPosition, new vscode.Position(document.lineCount, 0)));
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
    const userMessage = `${textBeforeCursor}{write code here}${textAfterCursor}`;
    let task = "completecode";
    const { systemPrompt, messageParams } = (0, utils_1.genPrompt)(task, userMessage);
    const fullText = await (0, handler_1.generateCode)(systemPrompt, messageParams, api_handler);
    const code = (0, utils_1.extractCode)(fullText);
    editor.edit(async (editBuilder) => {
        editBuilder.replace(selection, (0, codeFormat_1.formatCodeForInsertion)(code, textBeforeCursor));
    });
}
//# sourceMappingURL=codecompletement.js.map