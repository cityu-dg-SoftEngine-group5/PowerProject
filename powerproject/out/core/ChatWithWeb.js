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
const vscode = __importStar(require("vscode"));
const streamToString_1 = require("../utils/streamToString");
async function get_from_web() {
    try {
        // 从配置获取服务器地址
        const config = vscode.workspace.getConfiguration('webCompletion');
        const baseUrl = config.get('serverUrl');
        if (!baseUrl) {
            vscode.window.showErrorMessage('Web server URL not configured');
            return;
        }
        // 构建完整请求地址
        const apiUrl = vscode.Uri.parse(`${baseUrl}/api/receive`).toString();
        // 获取网络响应
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 自动检测响应类型
        const contentType = response.headers.get('content-type') || '';
        let completionContent;
        if (response.body) {
            // 处理流式响应
            completionContent = await (0, streamToString_1.streamToString)(response.body);
        }
        else {
            // 处理普通文本响应
            completionContent = await response.text();
        }
        // 解析内容（支持JSON和纯文本）
        let finalContent = completionContent;
        if (contentType.includes('application/json')) {
            try {
                const jsonData = JSON.parse(completionContent);
                // 如果包含processedCode字段则优先使用
                finalContent = jsonData.processedCode || completionContent;
            }
            catch {
                // 保持原始内容
            }
        }
        if (!finalContent) {
            vscode.window.showErrorMessage('Received empty completion content');
            return;
        }
        // 更新到活动编辑器
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const success = await editor.edit(editBuilder => {
                // 替换当前选中内容，如果没有选中则插入
                if (editor.selection.isEmpty) {
                    editBuilder.insert(editor.selection.active, finalContent);
                }
                else {
                    editBuilder.replace(editor.selection, finalContent);
                }
            });
            if (success) {
                vscode.window.showInformationMessage('Code applied successfully');
            }
            else {
                vscode.window.showErrorMessage('Failed to apply code');
            }
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Get from web failed: ${message}`);
    }
}
async function send_to_web() {
    try {
        const config = vscode.workspace.getConfiguration('webCompletion');
        const baseUrl = config.get('serverUrl');
        if (!baseUrl) {
            vscode.window.showErrorMessage('Web server URL not configured');
            return;
        }
        // 获取活动编辑器选中的内容
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }
        const selection = editor.selection;
        const selectedContent = editor.document.getText(selection);
        if (!selectedContent) {
            vscode.window.showInformationMessage('No selected content to send');
            return;
        }
        // 构建完整请求地址
        const apiUrl = vscode.Uri.parse(`${baseUrl}/api/send`).toString(); // 假设接口路径为/send
        const headers = new Headers();
        headers.append('Content-Type', 'text/plain; charset=utf-8'); // 默认使用纯文本
        // 发送POST请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: selectedContent
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 处理响应
        const responseContent = await response.text();
        vscode.window.showInformationMessage(`Code sent successfully. Server response: ${responseContent}`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Send to web failed: ${message}`);
    }
}
//# sourceMappingURL=ChatWithWeb.js.map