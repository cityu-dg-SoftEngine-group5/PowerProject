import { ApiConfiguration } from "../shared/api";
import { ApiStream } from "./transform/stream";
import { Anthropic } from "@anthropic-ai/sdk";
import { ApiHandler, buildApiHandler } from "./index";

export interface ApiProviderConfig {
  apiProvider: "openai" | "anthropic";
  apiKey: string;
  baseURL: string;
  ModelId: string;
}

// 分离请求级别配置
export interface RequestConfig {
  temperature: number;
  maxTokens: number;
}

export class CodeGenerationFramework {
  private apiHandler: ApiHandler;
  
  constructor(providerConfig: ApiProviderConfig) {
    // 初始化时处理API提供商配置
    this.apiHandler = buildApiHandler({
      apiProvider: providerConfig.apiProvider,
      ...(providerConfig.apiProvider === 'openai' && {
        openAiApiKey: providerConfig.apiKey,
        openAiBaseUrl: providerConfig.baseURL,
        openAiModelId: providerConfig.ModelId,
      }),
      ...(providerConfig.apiProvider === 'anthropic' && {
        anthropicBaseUrl: providerConfig.baseURL
      })
    });
  }

  // 独立的prompt生成方法（可扩展为不同策略）
  generateSystemPrompt(taskType?: string): string {
    return `You are a helpful AI assistant specialized in ${taskType || "general"} code generation. 
Provide clean, efficient and well-commented code.`;
  }

  // 核心执行方法
  async executeCodeGeneration(
    userMessage: string,
    requestConfig ?: RequestConfig,
    systemPrompt?: string
  ): Promise<string> {
    const finalSystemPrompt = systemPrompt || this.generateSystemPrompt();
    const messageParams: Anthropic.Messages.MessageParam[] = [
        { role: "user", content: userMessage },
    ];
    const stream = this.apiHandler.createMessage(
      finalSystemPrompt,messageParams
    );

    let generatedCode = "";
    for await (const chunk of stream) {
      if (chunk.type === "text") generatedCode += chunk.text;
    }
    return generatedCode;
  }
}
