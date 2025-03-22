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
        // 从配置获取动态服务器地址 
        const config = vscode.workspace.getConfiguration('webCompletion');
        const baseUrl = config.get<string>('serverUrl');
        
        if (!baseUrl) {
            vscode.window.showErrorMessage('Web server URL not configured');
            return;
        }

        // 构建完整API端点
        const apiUrl = vscode.Uri.parse(`${baseUrl}/api/send`).toString();

        // 获取编辑器内容
        const editor = vscode.window.activeTextEditor;
        let payloadContent = '';
        
        if (editor && !editor.selection.isEmpty) {
            payloadContent = editor.document.getText(editor.selection);
        } else {
            payloadContent = 'default code content'; 
        }

        // 发送请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: payloadContent })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 动态解析响应内容
        const contentType = response.headers.get('content-type') || '';
        let responseData: any;

        if (contentType.includes('application/json')) {
            try {
                responseData = await response.json();
            } catch {
                throw new Error('Invalid JSON response');
            }
        } else if (contentType.startsWith('text/')) {
            responseData = await response.text();
        } else {
            throw new Error(`Unsupported content-type: ${contentType}`);
        }

        // 字段提取
        const processedContent = typeof responseData === 'object' 
            ? responseData.processedCode || JSON.stringify(responseData)
            : responseData;

        if (!processedContent) {
            throw new Error('Empty processed content');
        }

        // 更新编辑器
        if (editor) {
            const success = await editor.edit(editBuilder => {
                if (editor.selection.isEmpty) {
                    editBuilder.insert(editor.selection.active, processedContent);
                } else {
                    editBuilder.replace(editor.selection, processedContent);
                }
            });

            vscode.window.showInformationMessage(
                success ? 'Content updated successfully' : 'Update failed'
            );
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Send to web failed: ${message}`);
    }
}
