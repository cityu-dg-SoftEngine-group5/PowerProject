"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = generateCode;
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
async function generateCode(systemPrompt, messageParams, api_handler) {
    const stream = api_handler.createMessage(systemPrompt, messageParams);
    let fullText = "";
    for await (const chunk of stream) {
        if (chunk.type === "text") {
            fullText += chunk.text;
        }
    }
    return fullText;
}
//# sourceMappingURL=handler.js.map