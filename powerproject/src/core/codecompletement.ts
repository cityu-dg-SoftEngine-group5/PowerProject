import * as vscode from 'vscode';
import { ApiConfiguration } from '../shared/api';
import { generateCode } from '../api/handler';
import { formatCodeForInsertion } from '../utils/codeFormat';
import { buildApiHandler, ApiHandler } from '../api/index';
import { genPrompt, extractCode } from '../api/utils';

export async function makeSuggestion() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const cursorPosition = selection.active;
    const textBeforeCursor = document.getText(
        new vscode.Range(new vscode.Position(0, 0), cursorPosition)
    );
    const textAfterCursor = document.getText(
        new vscode.Range(cursorPosition, new vscode.Position(document.lineCount, 0))
    );
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
    
    const userMessage = `${textBeforeCursor}{write code here}${textAfterCursor}`;
    let task = "completecode";

    const { systemPrompt, messageParams } = genPrompt(task, userMessage);
    
    const fullText = await generateCode(systemPrompt, messageParams, api_handler);
    const code = extractCode(fullText);
    editor.edit(async (editBuilder) => {
    editBuilder.replace(selection, formatCodeForInsertion(code, textBeforeCursor));
    });
}
