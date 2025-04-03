import * as vscode from 'vscode';
import { TerminalService } from './terminalservice';
import { ApiConfiguration } from '../shared/api';
import { generateCode } from '../api/handler';
import { formatCodeForInsertion } from '../utils/codeFormat';
import { buildApiHandler, ApiHandler } from '../api/index';
import { genPrompt, extractCode } from '../api/utils';


export async function terminalAndfile() {
   
        // 获取最后一条命令历史
    const lastHistory = TerminalService.getLastCommandHistory();
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
    const api_config: ApiConfiguration = {
        apiProvider: config.get('apiProvider'),
        apiKey: config.get('apiKey') as string,
        anthropicBaseUrl: config.get('baseURL') as string,
        openAiBaseUrl: config.get('baseURL') as string,
        openAiApiKey: config.get('apiKey') as string,
        openAiModelId: config.get('modelId') as string,
    };

    const api_handler: ApiHandler = buildApiHandler(api_config);



    // 拼接提示信息，包含代码与错误信息
    const prompt = `请根据以下代码和错误信息修复代码：
        
        代码:
        ${code}

        错误信息:
        ${lastHistory.output}

        修复后的代码:`;

    let task = "modifycode_terminalandfile";

    const { systemPrompt, messageParams } = genPrompt(task, prompt);

    const fullText = await generateCode(systemPrompt, messageParams, api_handler);
    const fixedCode = extractCode(fullText);


    // 在新的文件中显示改错后的代码
    // 替换当前文件内容
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(code.length)
    );
    editor.edit(editBuilder => {
        editBuilder.replace(fullRange, fixedCode);
    }).then(success => {
        if (success) {
            vscode.window.showInformationMessage('代码已成功替换为改错后的版本');
        } else {
            vscode.window.showErrorMessage('替换代码失败');
        }
    });
}
