// terminalService.ts
import { AITerminal } from "./aiterminal";

export class TerminalService {
    private static instance: AITerminal | null = null;

    // 设置当前终端实例（在终端创建时调用）
    public static setTerminal(terminal: AITerminal): void {
        TerminalService.instance = terminal;
    }

    // 获取当前终端实例
    public static getTerminal(): AITerminal | null {
        return TerminalService.instance;
    }

    // 返回全部命令历史
    public static getAllHistory(): Array<{ command: string; output: string }> {
        return TerminalService.instance ? TerminalService.instance.getAllHistory() : [];
    }

    // 返回最后一条命令及其输出
    public static getLastCommandHistory(): { command: string; output: string } | undefined {
        return TerminalService.instance ? TerminalService.instance.getLastCommandHistory() : undefined;
    }
}
