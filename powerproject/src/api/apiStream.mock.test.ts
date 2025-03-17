// __tests__/apiStream.mock.test.ts
import { ApiStreamChunk } from './transform/stream';
import { buildApiHandler } from './index';
import { Anthropic } from '@anthropic-ai/sdk';
export interface ApiStreamUsageChunk {
  type: "usage";
  readonly inputTokens: number;
  readonly outputTokens: number; 
  // 添加readonly增强类型安全
}
// 模拟API配置（参考网页6的安全实践）
const mockConfig = {
  apiProvider: 'anthropic' as const,
  apiKey: 'sk-mock-key-12345', // 符合格式的模拟密钥
  apiModelId: 'claude-3-7-sonnet-20250219',
  thinkingBudgetTokens: 500
};

// 完整模拟API响应流（参考网页8的事件生命周期）
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockImplementation(() => ({
        [Symbol.asyncIterator]: async function* () {
          // 初始用量事件
          yield { 
            type: 'message_start',
            message: { 
              usage: { 
                input_tokens: 150,
                output_tokens: 0,
                cache_creation_input_tokens: 30 
              } 
            }
          };
          
          // 推理过程事件
          yield {
            type: 'content_block_start',
            content_block: { 
              type: 'thinking', 
              thinking: '分析代码需求结构...' 
            }
          };
          
          // 文本生成事件
          yield { 
            type: 'content_block_delta',
            delta: { 
              type: 'text_delta',
              text: 'function sum(a: number, b: number) {\n' 
            }
          };
          yield { 
            type: 'content_block_delta',
            delta: { 
              type: 'text_delta',
              text: '  return a + b;\n}' 
            }
          };
          
          // 最终用量事件
          yield { 
            type: 'message_delta',
            usage: { 
              input_tokens: 150,
              output_tokens: 45 
            }
          };
        }
      }))
    }
  }))
}));

describe('API流式接口模拟测试套件', () => {
  let handler: ReturnType<typeof buildApiHandler>;
  
  beforeEach(() => {
    // 重置模拟状态（参考网页1的测试隔离原则）
    jest.clearAllMocks();
    handler = buildApiHandler(mockConfig);
  });

  test('应生成完整的TypeScript函数', async () => {
    const stream = handler.createMessage('代码助手', [
      { role: 'user', content: '生成求和函数' }
    ]);
    
    let finalText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'text') {
        finalText += chunk.text;
      }
    }
    
    // 方案二：标准化字符串
    const normalizedText = finalText.replace(/\s+/g, ' ');
    expect(normalizedText).toContain('function sum(a: number, b: number)');
  });

  
  // 修改测试用例中的类型断言部分
test('应包含两次用量统计事件', async () => {
  const stream = handler.createMessage('', []);
  const usages = [] as ApiStreamUsageChunk[]; // 明确类型声明
  
  for await (const chunk of stream) {
    if (isUsageChunk(chunk)) { // 添加类型守卫
      usages.push(chunk);
    }
  }
  
  expect(usages[0].inputTokens).toBe(150);
  expect(usages[1].outputTokens).toBe(45);
});

// 添加类型守卫函数
function isUsageChunk(chunk: ApiStreamChunk): chunk is ApiStreamUsageChunk {
  return chunk.type === 'usage';
}

  test('应正确处理推理过程', async () => {
    const stream = handler.createMessage('', []);
    let reasoning = '';
    
    for await (const chunk of stream) {
      if (chunk.type === 'reasoning') {
        reasoning += chunk.reasoning;
      }
    }
    
    // 验证推理链（参考网页8的逻辑验证）
    expect(reasoning).toMatch(/分析代码需求/);
  });
});