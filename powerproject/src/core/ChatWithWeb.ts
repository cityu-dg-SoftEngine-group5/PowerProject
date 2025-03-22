import * as vscode from 'vscode';
import { streamToString } from '../utils/streamToString';

async function get_from_web() {
    try {
        // 从配置获取服务器地址
        const config = vscode.workspace.getConfiguration('webCompletion');
        const baseUrl = config.get<string>('serverUrl');
        
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
        let completionContent: string;

        if (response.body) {
            // 处理流式响应
            completionContent = await streamToString(response.body);
        } else {
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
            } catch {
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
                } else {
                    editBuilder.replace(editor.selection, finalContent);
                }
            });

            if (success) {
                vscode.window.showInformationMessage('Code applied successfully');
            } else {
                vscode.window.showErrorMessage('Failed to apply code');
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Get from web failed: ${message}`);
    }
}





async function send_to_web() {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("No active editor");
            return;
        }

        // 获取选中内容（若未选中则取当前行）[3,5](@ref)
        const selection = editor.selection;
        let selectedText = editor.document.getText(selection);
        if (selectedText === "") {
            const currentLine = editor.document.lineAt(selection.active.line);
            selectedText = currentLine.text;
        }

        // 校验内容有效性
        if (!selectedText.trim()) {
            vscode.window.showErrorMessage("Selected content is empty");
            return;
        }

        // 网络请求（与 Get from web 保持相同超时和错误处理）
        const response = await fetch('http://localhost:3000/api/send', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: selectedText,
                metadata: {
                    language: editor.document.languageId,  // 携带代码类型（如 JavaScript/Python）
                    position: selection.active,            // 光标位置信息
                    timestamp: new Date().toISOString()
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 响应处理
        const result = await response.json();
        vscode.window.showInformationMessage('Code sent to web successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        vscode.window.showErrorMessage(`Send to web failed: ${message}`);
    }
}