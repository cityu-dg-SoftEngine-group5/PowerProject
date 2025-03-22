import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // 指定扩展开发路径和测试脚本路径
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    const extensionTestsPath = path.resolve(__dirname, './suite/test');

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      // 禁用其他扩展以避免干扰
      launchArgs: ['--disable-extensions']
    });
  } catch (err) {
    console.error('测试运行失败:', err);
    process.exit(1);
  }
}

main();