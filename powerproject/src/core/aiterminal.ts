import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export class AITerminal implements vscode.Pseudoterminal {
    // 用于向终端写入数据
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;

    // 终端关闭事件
    private closeEmitter = new vscode.EventEmitter<void>();
    onDidClose?: vscode.Event<void> = this.closeEmitter.event;

    // 保存终端全部输出（多轮命令累积）
    private outputBuffer: string = "";
    // 当前命令输入缓冲区
    private inputBuffer: string = "";
    // 记录每轮命令及其输出的历史
    private commandHistory: Array<{ command: string; output: string }> = [];
    // 当前执行命令的子进程
    private shellProcess: any;
    // 当前终端宽度（默认为80列）
    private terminalColumns: number = 80;


    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        if (initialDimensions) {
            this.terminalColumns = initialDimensions.columns;
        }
        this.writeEmitter.fire("欢迎使用 AI 终端\r\n");
        this.prompt();
    }

    setDimensions?(dimensions: vscode.TerminalDimensions): void {
        this.terminalColumns = dimensions.columns;
    }

    close(): void {
        if (this.shellProcess) {
            this.shellProcess.kill();
        }
        // 当终端关闭时清空所有历史数据
        this.clearHistory();
    }

    /**
     * 封装写入方法，同时保存到 outputBuffer 以便累积多轮命令输出
     */
    private write(data: string): void {
        this.outputBuffer += data;
        this.writeEmitter.fire(data);
    }

   /**
     * 实时回显用户输入，并在检测到换行符时将输入视为一条完整命令执行
     */
    handleInput(data: string): void {
        // 每收到一段输入就回显并追加到输入缓冲区
        this.write(data);
        this.inputBuffer += data;
        if (data.includes("\n") || data.includes("\r")) {
            const command = this.inputBuffer.trim();
            this.inputBuffer = "";
            if (command.length > 0) {
                this.executeCommand(command);
            } else {
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
    executeCommand(command: string) {
        this.write(`\r\n执行命令: ${command}\r\n`);
        
        const cwd = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : process.cwd();
        let stdoutBuffer = "";
        let stderrBuffer = "";

        this.shellProcess = spawn(command, { shell: true, cwd: cwd });

        this.shellProcess.stdout.on("data", (data: Buffer) => {
            const text = data.toString();
            stdoutBuffer += text;
            this.write(text);
        });

        this.shellProcess.stderr.on("data", (data: Buffer) => {
            const text = data.toString();
            stderrBuffer += text;
            this.write(text);
        });

        this.shellProcess.on("close", (code: number) => {
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
    public getAllHistory(): Array<{ command: string; output: string }> {
        return this.commandHistory;
    }

    /**
     * 接口2：返回最后一条命令及其执行结果
     */
    public getLastCommandHistory(): { command: string; output: string } | undefined {
        if (this.commandHistory.length > 0) {
            return this.commandHistory[this.commandHistory.length - 1];
        }
        return undefined;
    }

    /**
     * 清空历史记录（当终端关闭时调用）
     */
    public clearHistory(): void {
        this.outputBuffer = "";
        this.commandHistory = [];
    }
}