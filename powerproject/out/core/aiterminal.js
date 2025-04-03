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
exports.AITerminal = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
class AITerminal {
    // 用于向终端写入数据
    writeEmitter = new vscode.EventEmitter();
    onDidWrite = this.writeEmitter.event;
    // 终端关闭事件
    closeEmitter = new vscode.EventEmitter();
    onDidClose = this.closeEmitter.event;
    // 保存终端全部输出（多轮命令累积）
    outputBuffer = "";
    // 当前命令输入缓冲区
    inputBuffer = "";
    // 记录每轮命令及其输出的历史
    commandHistory = [];
    // 当前执行命令的子进程
    shellProcess;
    // 当前终端宽度（默认为80列）
    terminalColumns = 80;
    open(initialDimensions) {
        if (initialDimensions) {
            this.terminalColumns = initialDimensions.columns;
        }
        this.writeEmitter.fire("欢迎使用 AI 终端\r\n");
        this.prompt();
    }
    setDimensions(dimensions) {
        this.terminalColumns = dimensions.columns;
    }
    close() {
        if (this.shellProcess) {
            this.shellProcess.kill();
        }
        // 当终端关闭时清空所有历史数据
        this.clearHistory();
    }
    /**
     * 封装写入方法，同时保存到 outputBuffer 以便累积多轮命令输出
     */
    write(data) {
        this.outputBuffer += data;
        this.writeEmitter.fire(data);
    }
    /**
      * 实时回显用户输入，并在检测到换行符时将输入视为一条完整命令执行
      */
    handleInput(data) {
        // 每收到一段输入就回显并追加到输入缓冲区
        this.write(data);
        this.inputBuffer += data;
        if (data.includes("\n") || data.includes("\r")) {
            const command = this.inputBuffer.trim();
            this.inputBuffer = "";
            if (command.length > 0) {
                this.executeCommand(command);
            }
            else {
                this.prompt();
            }
        }
    }
    // 显示提示符
    prompt() {
        this.writeEmitter.fire("\r\n> ");
    }
    /**
     * 执行用户输入的命令：
     * - 使用 VSCode 安装目录作为工作目录（process.execPath 的所在目录）
     * - 实时输出命令的 stdout 与 stderr
     * - 在命令结束后，将命令及其输出记录到历史中
     */
    executeCommand(command) {
        this.write(`\r\n执行命令: ${command}\r\n`);
        const cwd = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : process.cwd();
        let stdoutBuffer = "";
        let stderrBuffer = "";
        this.shellProcess = (0, child_process_1.spawn)(command, { shell: true, cwd: cwd });
        this.shellProcess.stdout.on("data", (data) => {
            const text = data.toString();
            stdoutBuffer += text;
            this.write(text);
        });
        this.shellProcess.stderr.on("data", (data) => {
            const text = data.toString();
            stderrBuffer += text;
            this.write(text);
        });
        this.shellProcess.on("close", (code) => {
            if (code !== 0) {
                this.write(`\r\n命令退出，退出码: ${code}\r\n`);
            }
            // 保存本次命令及其输出到历史记录中
            this.commandHistory.push({
                command: command,
                output: stdoutBuffer + stderrBuffer
            });
            this.prompt();
        });
    }
    /**
     * 接口1：返回所有命令的历史记录
     */
    getAllHistory() {
        return this.commandHistory;
    }
    /**
     * 接口2：返回最后一条命令及其执行结果
     */
    getLastCommandHistory() {
        if (this.commandHistory.length > 0) {
            return this.commandHistory[this.commandHistory.length - 1];
        }
        return undefined;
    }
    /**
     * 清空历史记录（当终端关闭时调用）
     */
    clearHistory() {
        this.outputBuffer = "";
        this.commandHistory = [];
    }
}
exports.AITerminal = AITerminal;
//# sourceMappingURL=aiterminal.js.map