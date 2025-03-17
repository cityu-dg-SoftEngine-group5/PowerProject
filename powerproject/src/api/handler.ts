import { ApiConfiguration } from "../shared/api";
import { ApiStream } from "./transform/stream";
import { Anthropic } from "@anthropic-ai/sdk";
import { ApiHandler, buildApiHandler } from "./index";


async function generateCode(userMessage: string, config: {
  apiProvider: "openai" | "anthropic";
  apiKey: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  baseURL: string;
}): Promise<string> {
  const api_config: ApiConfiguration = {
    apiProvider: config.apiProvider,
    apiKey: config.apiKey,
  };

  if (config.apiProvider === 'openai') {
    api_config.openAiBaseUrl = config.baseURL;
    api_config.openAiApiKey = config.apiKey;
    api_config.openAiModelId = config.modelId;
  } else if (config.apiProvider === 'anthropic') {
    api_config.apiKey = config.apiKey;
    api_config.anthropicBaseUrl = config.baseURL;
  }

  const api_handler: ApiHandler = buildApiHandler(api_config);

  const systemPrompt: string = "You are a helpful AI assistant that generates code. Help me generate the code task for you.";

  const messageParams: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  const stream: ApiStream = api_handler.createMessage(systemPrompt, messageParams);

  let fullText: string = "";

  for await (const chunk of stream) {
    if (chunk.type === "text") {
      fullText += chunk.text;
    }
  }

  return fullText;
}

// 示例使用
async function main() {
  const userMessage = "Generate a function that returns the sum of two numbers.";
  const config = {
    apiProvider: "openai" as const,
    apiKey: "sk-IOMv20Q2hXNywuznWLZJEvCmG1SexZjevalacK6SF3Tys6m6",  // 替换真实API密钥
    modelId: "gpt-3.5-turbo",
    temperature: 0.5,
    maxTokens: 4096,
    baseURL: "https://api.chatgptsb.com/v1/"
  };

  const fullText = await generateCode(userMessage, config);
  console.log("完整的文本内容:", fullText);
}

main();

