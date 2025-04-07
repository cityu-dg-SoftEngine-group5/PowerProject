import * as vscode from 'vscode';
import { ApiConfiguration } from '../shared/api';
import { generateCode } from '../api/handler';
import { formatCodeForInsertion } from '../utils/codeFormat';
import { buildApiHandler, ApiHandler } from '../api/index';
import { genPrompt, extractCode } from '../api/utils';
async function fillInMid() {
    // Step1: 获取上下文内容
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }
    
    const document = editor.document;
    const cursorPosition = editor.selection.active;
    const currentLineNumber = cursorPosition.line;
    const lineText = document.lineAt(currentLineNumber).text;
    const cursorColumn = cursorPosition.character;
    
    
    // 计算起始行（确保不小于 0）
    const textBeforeCursor = lineText.substring(0, cursorColumn);
    const textAfterCursor = lineText.substring(cursorColumn); //获取光标前后代码

    // Step2: 获取扩展配置
    const config = vscode.workspace.getConfiguration('powerproject');
    const api_config: ApiConfiguration = {
        apiProvider: config.get('apiProvider'),
        apiKey: config.get('apiKey') as string,
        anthropicBaseUrl: config.get('baseURL') as string,
        openAiBaseUrl: config.get('baseURL') as string,
        openAiApiKey: config.get('apiKey') as string,
        openAiModelId: config.get('modelId') as string,
    };

    // Step3-4: 初始化AI处理器
    const api_handler = buildApiHandler(api_config);

    // Step5-6: 构造提示语
    const userMessage = `${textBeforeCursor}{write code here}${textAfterCursor}`;      
    let task = "CompleteCurrentLine";  //这里是当前行光标后有剩余代码，所以任务应该是补全当前行的代码，这个任务是codecompletion的一个子任务，只管当前行

    const { systemPrompt, messageParams } = genPrompt(task, userMessage);  
    // Step7: 生成代码
    const fullText = await generateCode(systemPrompt, messageParams, api_handler);
    const code = extractCode(fullText);
    //将生成的代码插入到光标位置
    editor.edit(async (editBuilder) => {
        editBuilder.replace(editor.selection, formatCodeForInsertion(code, textBeforeCursor));
    });
}