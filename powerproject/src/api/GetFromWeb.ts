import * as vscode from 'vscode';
import WebSocket from 'ws';

// 定义全局WebSocket客户端实例
let websocketClient: WebSocket | null = null;

// 初始化WebSocket连接
function initializeWebSocket(context: vscode.ExtensionContext) {
    try {
        websocketClient = new WebSocket('ws://your-websocket-endpoint');

        // 监听消息事件
        websocketClient.on('message', (data) => {
            handleWebSocketMessage(data);
        });

        // 错误处理
        websocketClient.on('error', (error) => {
            vscode.window.showErrorMessage(`WebSocket错误: ${error.message}`);
        });

        // 将关闭事件绑定到插件生命周期
        context.subscriptions.push({
            dispose: () => {
                if (websocketClient) {
                    websocketClient.close();
                }
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`WebSocket初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}

// 处理WebSocket接收的消息
async function handleWebSocketMessage(data: WebSocket.Data) {
    let content: string;
    
    // 处理不同数据类型
    if (data instanceof Buffer) {
        content = data.toString('utf-8');
    } else if (data instanceof ArrayBuffer) {
        content = Buffer.from(data).toString('utf-8');
    } else if (typeof data === 'string') {
        content = data;
    } else {
        vscode.window.showWarningMessage('收到不支持的数据格式');
        return;
    }

    // 插入编辑器
    await insertToEditor(content);
}

// 插入内容到活动编辑器
async function insertToEditor(content: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('没有活动的编辑器窗口');
        return;
    }

    // 在光标位置插入内容
    await editor.edit(editBuilder => {
        const position = editor.selection.active;
        editBuilder.insert(position, content);
    });
}

// 插件激活时初始化
export function activate(context: vscode.ExtensionContext) {
    initializeWebSocket(context);
    
    // 注册命令示例（假设你的send_to_web已经通过其他方式实现）
    context.subscriptions.push(
        vscode.commands.registerCommand('yourExtension.getFromWeb', () => {
            // 这里可以手动触发获取操作（如果设计需要）
        })
    );
}

// 插件停用时清理资源
export function deactivate() {
    if (websocketClient) {
        websocketClient.close();
    }
}