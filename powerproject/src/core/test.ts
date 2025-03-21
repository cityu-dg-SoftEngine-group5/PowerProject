import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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
        } catch (error: any) {
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
            } else {
                vscode.window.showErrorMessage('未找到活动编辑器。');
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`接收数据出错：${error.message}`);
        }
    });

    context.subscriptions.push(sendDisposable, receiveDisposable);
}

export function deactivate() {}