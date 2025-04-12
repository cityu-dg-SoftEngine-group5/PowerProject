// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { makeSuggestion } from './core/codecompletement';
import { selectModel } from './api/selectmodel';
import { VSCodeHttpServer } from './core/webserver';
import { AITerminal } from './core/aiterminal';
import { TerminalService } from './core/terminalservice';
import { terminalAndfile } from './core/terminalAndfile';
let webServer: VSCodeHttpServer | null = null;
let extensionContext: vscode.ExtensionContext;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	
	const webServerPort = vscode.workspace.getConfiguration('powerproject').get('webServerPort', 10098);
	webServer = new VSCodeHttpServer(webServerPort);
	//show the port in the status bar
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.text = `PowerProject: ${webServerPort}`;
	statusBarItem.show();
	webServer.start();

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

	const selectModelDisposable = vscode.commands.registerCommand('powerproject.selectModel', async () => {
		await selectModel();
	});

	context.subscriptions.push(disposable, selectModelDisposable);

	const terminalCommand = vscode.commands.registerCommand('powerproject.openAITerminal', () => {
        const aiTerminal = new AITerminal();
		TerminalService.setTerminal(aiTerminal);
        const terminal = vscode.window.createTerminal({ name: "AI Terminal", pty: aiTerminal });
        terminal.show();
    });
    context.subscriptions.push(terminalCommand);

	const terminalAndfileCommand = vscode.commands.registerCommand('powerproject.terminalAndfile', async() => {
		await terminalAndfile();
	});
	context.subscriptions.push(terminalAndfileCommand);

	// 导出获取上下文的函数，供其他模块使用
	return {
		getExtensionContext: () => extensionContext
	};
}

// This method is called when your extension is deactivated
export function deactivate() {
	if(webServer) {
		webServer.stop();
	}
}
