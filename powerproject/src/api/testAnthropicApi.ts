import { ApiHandler ,buildApiHandler} from "./index";
import { ApiConfiguration } from "../shared/api";
import { Anthropic } from "@anthropic-ai/sdk"; // 引入 Anthropic 类型

async function testCustomApi() {
    const config: ApiConfiguration = {
        apiProvider: "anthropic",
        apiKey: "sk-73Tq1ayTTbabUaJJ78AdF8685f5b4b929fAc67C233A9Cb76", // 替换为你的 API 密钥
        apiModelId: "claude-3-haiku-20240307", // 替换为模型 ID
        anthropicBaseUrl: "https://api.chatgptsb.com", // 指定第三方 API 的基础 URL
    };


    const handler: ApiHandler = buildApiHandler(config);

    const systemPrompt = "You are a helpful assistant.";
    const messages: Anthropic.Messages.MessageParam[] = [
        { role: "user", content: "Hello, how are you?" }, // 确保 role 是 "user" 或 "assistant"
    ];

    const stream = handler.createMessage(systemPrompt, messages);

    for await (const chunk of stream) {
        switch (chunk.type) {
            case "text":
                console.log("Text:", chunk.text);
                break;
        }
    }
}

testCustomApi().catch();