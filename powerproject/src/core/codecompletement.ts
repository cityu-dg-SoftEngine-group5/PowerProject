import * as vscode from 'vscode';
import { ApiConfiguration } from '../shared/api';
import { generateCode } from '../api/handler';
import { formatCodeForInsertion } from '../utils/codeFormat';
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

    const config = {
        apiProvider: "openai" as const,
        apiKey: "sk-IOMv20Q2hXNywuznWLZJEvCmG1SexZjevalacK6SF3Tys6m6",  // 替换真实API密钥
        modelId: "gpt-3.5-turbo",
        temperature: 0.5,
        maxTokens: 4096,
        baseURL: "https://api.chatgptsb.com/v1/"
      };

      const userMessage = `${textBeforeCursor}{write code here}${textAfterCursor}`;
    
      const fullText = await generateCode(userMessage, config);

      editor.edit(async (editBuilder) => {
        editBuilder.replace(selection, formatCodeForInsertion(fullText, textBeforeCursor));
      });
}
