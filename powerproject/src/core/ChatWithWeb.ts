import * as vscode from 'vscode';

async function get_from_web() {
    try {
        // 从网络接口获取数据（支持stream或string）
        const response = await fetch('http://localhost:3000/api/receive');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 将响应内容统一转换为string类型
        const content = response.body ?
            await streamToString(response.body) :  // 处理stream类型
            await response.text();                // 处理string类型

        // 解析返回内容（假设返回JSON格式）
        const result = JSON.parse(content);
        
        if (!result.processedCode) {
            vscode.window.showErrorMessage('Received empty completion content');
            return;
        }

        // 更新到活动编辑器
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // 使用VS Code的edit API进行内容修改
            const success = await editor.edit(editBuilder => {
                // 在光标位置插入内容（可改为替换选中内容）
                editBuilder.insert(editor.selection.active, result.processedCode);
            });

            if (success) {
                vscode.window.showInformationMessage('Code completion applied successfully');
            } else {
                vscode.window.showErrorMessage('Failed to apply code completion');
            }
        } else {
            vscode.window.showWarningMessage('No active editor found');
        }
    } catch (error) {
        let errorMessage = "Unknown error";
        if (error instanceof Error) errorMessage = error.message;
        vscode.window.showErrorMessage(`Get from web failed: ${errorMessage}`);
    }
}

// 将ReadableStream转换为string的辅助函数
async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
    }
    
    return new TextDecoder().decode(Buffer.concat(chunks));
}

// 在命令中调用示例
let receiveDisposable = vscode.commands.registerCommand('extension.receiveFromWeb', get_from_web);


// 使用 vscode.ExtensionContext
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('command', () => {});
    context.subscriptions.push(receiveDisposable); // 正确访问 subscriptions
}