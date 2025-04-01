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
exports.VSCodeHttpServer = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
class VSCodeHttpServer {
    port;
    server = null;
    constructor(port) {
        this.port = port;
    }
    start() {
        this.server = http.createServer((req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                res.writeHead(500);
                res.end('No active text editor');
                return;
            }
            if (req.method === 'GET' && req.url === '/sendtoweb') {
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                const currentLine = editor.document.lineAt(selection.active.line).text;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    codes: selectedText,
                    line: currentLine
                }));
            }
            else if (req.method === 'POST' && req.url === '/getfromweb') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });
                req.on('end', () => {
                    try {
                        const { code } = JSON.parse(body);
                        const currentCode = editor.selection.active;
                        const insertPosition = new vscode.Position(currentCode.line + 1, 0);
                        editor.edit(editBuilder => {
                            editBuilder.insert(insertPosition, code + '\n');
                        }).then(success => {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success }));
                        });
                    }
                    catch (error) {
                        res.statusCode = 400;
                        res.end('Invalid JSON');
                    }
                });
            }
            else {
                res.statusCode = 404;
                res.end('Not found');
            }
        });
        this.server.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            console.log(`Server on port ${this.port} closed`);
        }
    }
}
exports.VSCodeHttpServer = VSCodeHttpServer;
// async function get_from_web() {
//     try {
//         // 从配置获取服务器地址
//         const config = vscode.workspace.getConfiguration('webCompletion');
//         const baseUrl = config.get<string>('serverUrl');
//         if (!baseUrl) {
//             vscode.window.showErrorMessage('Web server URL not configured');
//             return;
//         }
//         // 构建完整请求地址
//         const apiUrl = vscode.Uri.parse(`${baseUrl}/api/receive`).toString();
//         // 获取网络响应
//         const response = await fetch(apiUrl);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         // 自动检测响应类型
//         const contentType = response.headers.get('content-type') || '';
//         let completionContent: string;
//         if (response.body) {
//             // 处理流式响应
//             completionContent = await streamToString(response.body);
//         } else {
//             // 处理普通文本响应
//             completionContent = await response.text();
//         }
//         // 解析内容（支持JSON和纯文本）
//         let finalContent = completionContent;
//         if (contentType.includes('application/json')) {
//             try {
//                 const jsonData = JSON.parse(completionContent);
//                 // 如果包含processedCode字段则优先使用
//                 finalContent = jsonData.processedCode || completionContent;
//             } catch {
//                 // 保持原始内容
//             }
//         }
//         if (!finalContent) {
//             vscode.window.showErrorMessage('Received empty completion content');
//             return;
//         }
//         // 更新到活动编辑器
//         const editor = vscode.window.activeTextEditor;
//         if (editor) {
//             const success = await editor.edit(editBuilder => {
//                 // 替换当前选中内容，如果没有选中则插入
//                 if (editor.selection.isEmpty) {
//                     editBuilder.insert(editor.selection.active, finalContent);
//                 } else {
//                     editBuilder.replace(editor.selection, finalContent);
//                 }
//             });
//             if (success) {
//                 vscode.window.showInformationMessage('Code applied successfully');
//             } else {
//                 vscode.window.showErrorMessage('Failed to apply code');
//             }
//         }
//     } catch (error) {
//         const message = error instanceof Error ? error.message : 'Unknown error';
//         vscode.window.showErrorMessage(`Get from web failed: ${message}`);
//     }
// }
// async function send_to_web() {
//     try {
//         const config = vscode.workspace.getConfiguration('webCompletion');
//         const baseUrl = config.get<string>('serverUrl');
//         if (!baseUrl) {
//             vscode.window.showErrorMessage('Web server URL not configured');
//             return;
//         }
//         // 获取活动编辑器选中的内容
//         const editor = vscode.window.activeTextEditor;
//         if (!editor) {
//             vscode.window.showErrorMessage('No active text editor');
//             return;
//         }
//         const selection = editor.selection;
//         const selectedContent = editor.document.getText(selection);
//         if (!selectedContent) {
//             vscode.window.showInformationMessage('No selected content to send');
//             return;
//         }
//         // 构建完整请求地址
//         const apiUrl = vscode.Uri.parse(`${baseUrl}/api/send`).toString(); // 假设接口路径为/send
//         const headers = new Headers();
//         headers.append('Content-Type', 'text/plain; charset=utf-8'); // 默认使用纯文本
//         // 发送POST请求
//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: headers,
//             body: selectedContent   
//         });
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         // 处理响应
//         const responseContent = await response.text();
//         vscode.window.showInformationMessage(`Code sent successfully. Server response: ${responseContent}`);
//     } catch (error) {
//         const message = error instanceof Error ? error.message : 'Unknown error';
//         vscode.window.showErrorMessage(`Send to web failed: ${message}`);
//     }
// }
//# sourceMappingURL=webserver.js.map