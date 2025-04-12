"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const codecompletement_1 = require("./core/codecompletement");
const selectmodel_1 = require("./api/selectmodel");
const webserver_1 = require("./core/webserver");
const aiterminal_1 = require("./core/aiterminal");
const terminalservice_1 = require("./core/terminalservice");
const terminalAndfile_1 = require("./core/terminalAndfile");
let webServer = null;
let extensionContext;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    extensionContext = context;
    const webServerPort = vscode.workspace.getConfiguration('powerproject').get('webServerPort', 10098);
    webServer = new webserver_1.VSCodeHttpServer(webServerPort);
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
            await (0, codecompletement_1.makeSuggestion)();
        });
    });
    const selectModelDisposable = vscode.commands.registerCommand('powerproject.selectModel', async () => {
        await (0, selectmodel_1.selectModel)();
    });
    context.subscriptions.push(disposable, selectModelDisposable);
    const terminalCommand = vscode.commands.registerCommand('powerproject.openAITerminal', () => {
        const aiTerminal = new aiterminal_1.AITerminal();
        terminalservice_1.TerminalService.setTerminal(aiTerminal);
        const terminal = vscode.window.createTerminal({ name: "AI Terminal", pty: aiTerminal });
        terminal.show();
    });
    context.subscriptions.push(terminalCommand);
    const terminalAndfileCommand = vscode.commands.registerCommand('powerproject.terminalAndfile', async () => {
        await (0, terminalAndfile_1.terminalAndfile)();
    });
    context.subscriptions.push(terminalAndfileCommand);
    // 导出获取上下文的函数，供其他模块使用
    return {
        getExtensionContext: () => extensionContext
    };
}
// This method is called when your extension is deactivated
function deactivate() {
    if (webServer) {
        webServer.stop();
    }
}
//# sourceMappingURL=extension.js.map