"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalService = void 0;
class TerminalService {
    static instance = null;
    // 设置当前终端实例（在终端创建时调用）
    static setTerminal(terminal) {
        TerminalService.instance = terminal;
    }
    // 获取当前终端实例
    static getTerminal() {
        return TerminalService.instance;
    }
    // 返回全部命令历史
    static getAllHistory() {
        return TerminalService.instance ? TerminalService.instance.getAllHistory() : [];
    }
    // 返回最后一条命令及其输出
    static getLastCommandHistory() {
        return TerminalService.instance ? TerminalService.instance.getLastCommandHistory() : undefined;
    }
}
exports.TerminalService = TerminalService;
//# sourceMappingURL=terminalservice.js.map