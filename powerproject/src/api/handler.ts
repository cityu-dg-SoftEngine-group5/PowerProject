import { ApiConfiguration } from "../shared/api";
import { ApiStream } from "./transform/stream";
import { Anthropic } from "@anthropic-ai/sdk";
import { ApiHandler, buildApiHandler } from "./index";
import { logHistory } from '../utils/historyLogger';


// export async function generateCode(userMessage: string, config: {
//   apiProvider: "openai" | "anthropic";
//   apiKey: string;
//   modelId: string;
//   temperature: number;
//   maxTokens: number;
//   baseURL: string;
// }): Promise<string> {
//   const api_config: ApiConfiguration = {
//     apiProvider: config.apiProvider,
//     apiKey: config.apiKey,
//   };

//   if (config.apiProvider === 'openai') {
//     api_config.openAiBaseUrl = config.baseURL;
//     api_config.openAiApiKey = config.apiKey;
//     api_config.openAiModelId = config.modelId;
//   } else if (config.apiProvider === 'anthropic') {
//     api_config.apiKey = config.apiKey;
//     api_config.anthropicBaseUrl = config.baseURL;
//   }

//   const api_handler: ApiHandler = buildApiHandler(api_config);

//   const systemPrompt: string = "You are a helpful AI assistant that generates code. Help me generate the code task for you.";

//   const messageParams: Anthropic.Messages.MessageParam[] = [
//     { role: "user", content: userMessage },
//   ];

//   const stream: ApiStream = api_handler.createMessage(systemPrompt, messageParams);

//   let fullText: string = "";

//   for await (const chunk of stream) {
//     if (chunk.type === "text") {
//       fullText += chunk.text;
//     }
//   }

//   return fullText;
// }

export async function generateCode(systemPrompt: string, messageParams: Anthropic.Messages.MessageParam[], api_handler: ApiHandler): Promise<string> {
  const stream: ApiStream = api_handler.createMessage(systemPrompt, messageParams);
  let fullText: string = "";

  for await (const chunk of stream) {
    if (chunk.type === "text") {
      fullText += chunk.text;
    }
  }
  const userMessage = messageParams.find(msg => msg.role === 'user')?.content as string || '';

  await logHistory(userMessage, systemPrompt, fullText);

  return fullText;
}


