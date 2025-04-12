import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface HistoryEntry {
    timestamp: string;
    userMessage: string;
    systemPrompt: string;
    result?: string;
}

export async function logHistory(userMessage: string, systemPrompt: string, result?: string): Promise<void> {
    // 检查设置是否启用日志记录
    const config = vscode.workspace.getConfiguration('powerproject');
    const isLoggingEnabled = config.get('enableHistoryLogging') as boolean;
    
    if (!isLoggingEnabled) {
        return; // 如果禁用了日志记录，直接返回
    }

    try {
        // 获取历史记录存储路径
        let historyFolderPath: string;
        
        // 尝试获取扩展上下文存储路径
        const extensionContext = await getExtensionContext();
        if (extensionContext) {
            historyFolderPath = path.join(extensionContext.globalStoragePath, 'history');
        } else {
            // 回退：如果无法获取扩展上下文，使用当前工作区路径
            console.warn('无法获取扩展上下文，使用工作区路径存储历史记录');
            
            // 获取当前工作区文件夹
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                // 使用第一个工作区文件夹，在其中创建 .powerproject/history 目录
                const workspacePath = workspaceFolders[0].uri.fsPath;
                historyFolderPath = path.join(workspacePath, '.powerproject', 'history');
            } else {
                // 如果没有打开的工作区，则使用用户的主目录
                console.warn('未找到工作区文件夹，使用用户主目录');
                historyFolderPath = path.join(os.homedir(), '.powerproject', 'history');
            }
        }
        
        // 确保历史文件夹存在
        if (!fs.existsSync(historyFolderPath)) {
            fs.mkdirSync(historyFolderPath, { recursive: true });
        }

        // 创建当前年月的文件名
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const historyFilePath = path.join(historyFolderPath, `history-${yearMonth}.json`);

        // 创建历史条目
        const historyEntry: HistoryEntry = {
            timestamp: now.toISOString(),
            userMessage,
            systemPrompt,
            result
        };

        // 读取现有历史或创建新数组
        let historyData: HistoryEntry[] = [];
        if (fs.existsSync(historyFilePath)) {
            const fileContent = fs.readFileSync(historyFilePath, 'utf8');
            try {
                historyData = JSON.parse(fileContent);
            } catch (e) {
                console.error('解析历史文件失败:', e);
            }
        }

        // 添加新条目
        historyData.push(historyEntry);

        // 写入文件
        fs.writeFileSync(historyFilePath, JSON.stringify(historyData, null, 2), 'utf8');
        console.log(`历史记录已保存到: ${historyFilePath}`);
    } catch (error) {
        console.error('记录历史失败:', error);
    }
}

// 辅助函数，获取扩展上下文
async function getExtensionContext(): Promise<vscode.ExtensionContext | undefined> {
    const extension = vscode.extensions.getExtension('powerproject');
    if (extension) {
        if (!extension.isActive) {
            await extension.activate();
        }
        return extension.exports.getExtensionContext();
    }
    return undefined;
}

// 查看历史记录的函数，用于后续实现历史记录浏览功能
export async function viewHistory(): Promise<HistoryEntry[] | undefined> {
    try {
        // 获取历史记录存储路径
        let historyFolderPath: string | undefined;
        
        // 尝试获取扩展上下文存储路径
        const extensionContext = await getExtensionContext();
        if (extensionContext) {
            historyFolderPath = path.join(extensionContext.globalStoragePath, 'history');
        } else {
            // 回退：如果无法获取扩展上下文，尝试使用工作区路径
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                const workspacePath = workspaceFolders[0].uri.fsPath;
                historyFolderPath = path.join(workspacePath, '.powerproject', 'history');
            } else {
                // 如果没有打开的工作区，则使用用户的主目录
                historyFolderPath = path.join(os.homedir(), '.powerproject', 'history');
            }
        }

        if (!historyFolderPath || !fs.existsSync(historyFolderPath)) {
            return [];
        }

        // 获取所有历史文件
        const historyFiles = fs.readdirSync(historyFolderPath)
            .filter(file => file.startsWith('history-') && file.endsWith('.json'))
            .sort()
            .reverse(); // 最新的文件在前面

        if (historyFiles.length === 0) {
            return [];
        }

        // 读取最新的历史文件
        const latestHistoryFile = path.join(historyFolderPath, historyFiles[0]);
        const fileContent = fs.readFileSync(latestHistoryFile, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('读取历史记录失败:', error);
        return undefined;
    }
} 