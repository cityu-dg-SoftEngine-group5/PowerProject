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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    // 命令：发送数据到网页服务
    let sendDisposable = vscode.commands.registerCommand('extension.sendToWeb', async () => {
        const editor = vscode.window.activeTextEditor;
        let codeToSend = '';
        if (editor) {
            // 获取选中的文本（如果有）
            const selection = editor.document.getText(editor.selection);
            if (selection) {
                codeToSend = selection;
            }
        }
        // 如果没有选中文本，发送默认内容（也可以提示用户输入）
        if (!codeToSend) {
            codeToSend = 'default code content';
        }
        try {
            const response = await fetch('http://localhost:3000/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: codeToSend })
            });
            if (!response.ok) {
                throw new Error(`请求失败，状态码：${response.status}`);
            }
            const result = await response.json();
            vscode.window.showInformationMessage(result.message || '数据已发送到网页服务。');
        }
        catch (error) {
            vscode.window.showErrorMessage(`发送数据出错：${error.message}`);
        }
    });
    // 命令：从网页服务接收处理后的代码并更新编辑器
    let receiveDisposable = vscode.commands.registerCommand('extension.receiveFromWeb', async () => {
        try {
            const response = await fetch('http://localhost:3000/api/receive');
            if (!response.ok) {
                throw new Error(`请求失败，状态码：${response.status}`);
            }
            const result = await response.json();
            if (!result.processedCode) {
                vscode.window.showErrorMessage('未接收到处理后的代码。');
                return;
            }
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                // 在光标位置插入接收到的代码，你也可以选择替换选中区域
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, result.processedCode);
                });
                vscode.window.showInformationMessage('已接收到处理后的代码并更新编辑器。');
            }
            else {
                vscode.window.showErrorMessage('未找到活动编辑器。');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`接收数据出错：${error.message}`);
        }
    });
    context.subscriptions.push(sendDisposable, receiveDisposable);
}
function deactivate() { }
//# sourceMappingURL=test.js.map