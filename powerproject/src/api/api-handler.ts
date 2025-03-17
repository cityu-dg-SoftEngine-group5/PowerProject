// api-handler.ts
import { ApiConfiguration } from "../shared/api";
import { ApiHandler, buildApiHandler, } from "./index";
import { AnthropicHandler } from "./providers/anthropic";
import { OpenAiHandler } from "./providers/openai";
import { ApiStream } from "./transform/stream";
import { Anthropic } from "@anthropic-ai/sdk"
type HandlerConfig = ApiConfiguration & {
  apiKey: string;
  baseURL?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
};

export class AiCompletionHandler {
  private handler: ApiHandler;

  constructor(config: HandlerConfig) {
    switch (config.apiProvider) {
      case "anthropic":
        this.handler = new AnthropicHandler({
          apiKey: config.apiKey,
          apiModelId: config.modelId,
          openAiBaseUrl: config.baseURL,
          azureApiVersion: config["azureApiVersion"], // 兼容Azure参数
          o3MiniReasoningEffort: config["o3MiniReasoningEffort"],
        });
        break;
      case "openai":
        this.handler = new OpenAiHandler({
          openAiApiKey: config.apiKey,
          openAiModelId: config.modelId,
          openAiBaseUrl: config.baseURL || "https://api.chatgptsb.com",
          azureApiVersion: config["azureApiVersion"],
          o3MiniReasoningEffort: config["o3MiniReasoningEffort"],
          openAiModelInfo: {
              maxTokens: config.maxTokens,
              temperature: config.temperature,
              supportsPromptCache: false
          },
        });
        break;
      default:
        throw new Error(`Unsupported provider: ${config.apiProvider}`);
    }
  }

  async *getCodeCompletion(
    prompt: string,
    systemMessage: string = "You are a helpful AI assistant that generates code. Return ONLY the code without explanations.",
    config: HandlerConfig
  ): ApiStream {
    console.log("Sending request to API...");
    // 构建消息结构
    switch (config.apiProvider) {
      case "anthropic":
        return this.handler.createMessage(systemMessage, [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ]);
      case "openai":
        return this.handler.createMessage(systemMessage, [
          {
            role: "user",
            content: prompt,
          },
        ]);
      default:
        throw new Error(`Unsupported provider: ${config.apiProvider}`);
    }
  }
}

