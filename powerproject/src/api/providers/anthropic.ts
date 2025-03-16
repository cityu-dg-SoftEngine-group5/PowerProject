import { Anthropic } from "@anthropic-ai/sdk";
import { Stream as AnthropicStream } from "@anthropic-ai/sdk/streaming";
import { withRetry } from "../retry";
import { anthropicDefaultModelId, AnthropicModelId, anthropicModels, ApiHandlerOptions, ModelInfo } from "../../shared/api";
import { ApiHandler } from "../index";
import { ApiStream } from "../transform/stream";

export class AnthropicHandler implements ApiHandler {
    private options: ApiHandlerOptions;
    private client: Anthropic;

    constructor(options: ApiHandlerOptions) {
        this.options = options;
        this.client = new Anthropic({
            apiKey: this.options.apiKey,
            baseURL: "https://api.chatgptsb.com", // 设置第三方 API 的基础 URL
        });
		console.log("Using API URL:", this.client.baseURL); // 打印使用的 URL
        console.log("Using API Key:", this.options.apiKey); // 打印使用的 API 密钥
    }

    @withRetry()
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.getModel();
		const modelId = model.id;
		const stream = await this.client.messages.create(
			{
				model: modelId,
				system: systemPrompt,
				messages: messages,
				max_tokens: model.info.maxTokens || 8192,
				temperature: 0,
				stream: true,
			},
			{
				path: "/v1/chat/completions", // 指定自定义路径
				headers: {
					Authorization: `Bearer ${this.options.apiKey}`, // 添加认证头
				},
			}
		);
		console.log("Request successful, streaming response..."); // 打印请求成功信息
		for await (const chunk of stream) {
			switch (chunk.type) {
				case "message_start":
					const usage = chunk.message.usage;
					yield {
						type: "usage",
						inputTokens: usage.input_tokens || 0,
						outputTokens: usage.output_tokens || 0,
						cacheWriteTokens: usage.cache_creation_input_tokens || undefined,
						cacheReadTokens: usage.cache_read_input_tokens || undefined,
					};
					break;
				case "message_delta":
					yield {
						type: "usage",
						inputTokens: 0,
						outputTokens: chunk.usage.output_tokens || 0,
					};
					break;
				case "content_block_start":
					switch (chunk.content_block.type) {
						case "text":
							yield {
								type: "text",
								text: chunk.content_block.text,
							};
							break;
					}
					break;
				case "content_block_delta":
					switch (chunk.delta.type) {
						case "text_delta":
							yield {
								type: "text",
								text: chunk.delta.text,
							};
							break;
					}
					break;
			}
		}
	}
    getModel(): { id: AnthropicModelId; info: ModelInfo } {
        const modelId = this.options.apiModelId;
        if (modelId && modelId in anthropicModels) {
            const id = modelId as AnthropicModelId;
            return { id, info: anthropicModels[id] };
        }
        return {
            id: anthropicDefaultModelId,
            info: anthropicModels[anthropicDefaultModelId],
        };
    }
}

