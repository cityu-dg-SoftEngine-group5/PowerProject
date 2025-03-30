import * as vscode from 'vscode';
import { ApiConfiguration } from '../shared/api';
import { generateCode } from '../api/handler';
import { formatCodeForInsertion } from '../utils/codeFormat';
import { buildApiHandler, ApiHandler } from '../api/index';
import { genPrompt, extractCode } from '../api/utils';
async function predectNextCode() {
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
    
    // 检查光标后是否有非空白字符
    const remainingText = lineText.slice(cursorColumn).trim();
    const hasCodeAfterCursor = remainingText.length > 0; //当前行在光标后还有剩余代码 1 ，没有代码 0
    
    // 计算起始行（确保不小于 0）
    const textBeforeCursor = lineText.substring(0, cursorColumn);
    const textAfterCursor = lineText.substring(cursorColumn); //获取光标前后代码
    const startLine = Math.max(0, currentLineNumber - 5);
    const startPos = new vscode.Position(startLine, 0);
    const endPos = new vscode.Position(currentLineNumber, Infinity);
    const range = new vscode.Range(startPos, endPos);
    const contextCode = document.getText(range); //获取当前行之前五行的代码

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
    if(hasCodeAfterCursor) {
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
    }else{
        const userMessage = `${contextCode}{write code here}`;      
        let task = "PrdectNextLine"; //根据前五行代码预测下一行代码

        const { systemPrompt, messageParams } = genPrompt(task, userMessage);
        const fullText = await generateCode(systemPrompt, messageParams, api_handler);
        const code = extractCode(fullText);
        editor.edit(async (editBuilder) => {
            editBuilder.replace(editor.selection, formatCodeForInsertion(code, textBeforeCursor));
        });
    }
}