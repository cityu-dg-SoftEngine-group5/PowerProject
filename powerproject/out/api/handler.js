"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = generateCode;
const index_1 = require("./index");
async function generateCode(userMessage, config) {
    const api_config = {
        apiProvider: config.apiProvider,
        apiKey: config.apiKey,
    };
    if (config.apiProvider === 'openai') {
        api_config.openAiBaseUrl = config.baseURL;
        api_config.openAiApiKey = config.apiKey;
        api_config.openAiModelId = config.modelId;
    }
    else if (config.apiProvider === 'anthropic') {
        api_config.apiKey = config.apiKey;
        api_config.anthropicBaseUrl = config.baseURL;
    }
    const api_handler = (0, index_1.buildApiHandler)(api_config);
    const systemPrompt = "You are a helpful AI assistant that generates code. Help me generate the code task for you.";
    const messageParams = [
        { role: "user", content: userMessage },
    ];
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