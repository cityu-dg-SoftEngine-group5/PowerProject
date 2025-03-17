import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration, ModelInfo } from "../core/api"
import { ApiStream, ApiStreamUsageChunk } from "../transform/stream"
import { AnthropicHandler } from "../providers/anthropic"
import { OpenAiHandler } from "../providers/openai"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): { id: string; info: ModelInfo }
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

export function buildApiHandler(configuration: ApiConfiguration): ApiHandler {
	const { apiProvider, ...options } = configuration
	switch (apiProvider) {
	
		case "openai":
			return new OpenAiHandler(options)
		default:
			return new AnthropicHandler(options)
	}
}