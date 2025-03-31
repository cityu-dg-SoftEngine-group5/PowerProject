import * as vscode from 'vscode';
import { ApiConfiguration } from '../shared/api';
import { generateCode } from '../api/handler';
import { formatCodeForInsertion } from '../utils/codeFormat';
import { buildApiHandler, ApiHandler } from '../api/index';
import { genPrompt, extractCode } from '../api/utils';

export async function debugAndFix() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedCode = document.getText(selection);
    
    const errorPatterns = [
        /undefined/g, 
        /await\s+[^(async)]/g,
        /\.then$.*$\.catch$.*$/g
    ];
    const detectedErrors = errorPatterns.filter(pattern => pattern.test(selectedCode));

    const codeContext = {
        selectedCode,
        language: document.languageId,
        errorHints: detectedErrors.join(';'),
        variables: await getRelatedVariables(document, selection) 
    };

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

    const debugTaskType = detectedErrors.length > 0 ? "FixKnownErrors" : "AnalyzeAndFix";
    const { systemPrompt, messageParams } = genPrompt(debugTaskType, JSON.stringify(codeContext));

    
    const debugResponse = await generateCode(systemPrompt, messageParams, api_handler);
    const fixedCode = extractCode(debugResponse);

    await editor.edit(editBuilder => {
        editBuilder.replace(selection, formatCodeForInsertion(
            fixedCode, 
            document.getText(new vscode.Range(selection.start.with({ line: selection.start.line - 1 }), selection.start))
        ));
    });





    // 设置断点
    if (fixedCode.includes('debugger')) {
        const newLine = selection.end.line + 1;
        editor.setDecorations(breakpointDecoration, [new vscode.Range(newLine, 0, newLine, 0)]);
    }
    
}

async function getRelatedVariables(document: vscode.TextDocument, selection: vscode.Selection) {
    const variableRegex = /(const|let|var)\s+(\w+)/g;
    const codeBefore = document.getText(new vscode.Range(
        new vscode.Position(0, 0), 
        selection.start
    ));
    return [...codeBefore.matchAll(variableRegex)].map(match => match[2]);
}

// 断点可视化装饰器
const breakpointDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.parse('data:image/svg+xml;utf8,<svg width="16" height="16"><circle cx="8" cy="8" r="6" fill="red"/></svg>')
});