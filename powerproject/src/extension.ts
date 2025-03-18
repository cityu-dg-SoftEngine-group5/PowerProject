// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { makeSuggestion } from './core/codecompletement';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('powerproject.suggest', async () => {
		// The code you place here will be executed every time your command is executed
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Generating code suggestions...',
		}, async (progress, token) => {
			await makeSuggestion();
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
