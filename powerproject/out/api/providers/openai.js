"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiHandler = void 0;
const openai_1 = __importStar(require("openai"));
const retry_1 = require("../retry");
const api_1 = require("../../shared/api");
const openai_format_1 = require("../transform/openai-format");
const r1_format_1 = require("../transform/r1-format");
class OpenAiHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        // Azure API shape slightly differs from the core API shape: https://github.com/openai/openai-node?tab=readme-ov-file#microsoft-azure-openai
        if (this.options.openAiBaseUrl?.toLowerCase().includes("azure.com")) {
            this.client = new openai_1.AzureOpenAI({
                baseURL: this.options.openAiBaseUrl,
                apiKey: this.options.openAiApiKey,
                apiVersion: this.options.azureApiVersion || api_1.azureOpenAiDefaultApiVersion,
            });
        }
        else {
            this.client = new openai_1.default({
                baseURL: this.options.openAiBaseUrl,
                apiKey: this.options.openAiApiKey,
            });
        }
    }
    async *createMessage(systemPrompt, messages) {
        const modelId = this.options.openAiModelId ?? "";
        const isDeepseekReasoner = modelId.includes("deepseek-reasoner");
        const isO3Mini = modelId.includes("o3-mini");
        let openAiMessages = [
            { role: "system", content: systemPrompt },
            ...(0, openai_format_1.convertToOpenAiMessages)(messages),
        ];
        let temperature = this.options.openAiModelInfo?.temperature ?? api_1.openAiModelInfoSaneDefaults.temperature;
        let reasoningEffort = undefined;
        if (isDeepseekReasoner) {
            openAiMessages = (0, r1_format_1.convertToR1Format)([{ role: "user", content: systemPrompt }, ...messages]);
        }
        if (isO3Mini) {
            openAiMessages = [{ role: "developer", content: systemPrompt }, ...(0, openai_format_1.convertToOpenAiMessages)(messages)];
            temperature = undefined; // does not support temperature
            reasoningEffort = this.options.o3MiniReasoningEffort || "medium";
        }
        const stream = await this.client.chat.completions.create({
            model: modelId,
            messages: openAiMessages,
            temperature,
            reasoning_effort: reasoningEffort,
            stream: true,
            stream_options: { include_usage: true },
        });
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
                yield {
                    type: "text",
                    text: delta.content,
                };
            }
            if (delta && "reasoning_content" in delta && delta.reasoning_content) {
                yield {
                    type: "reasoning",
                    reasoning: delta.reasoning_content || "",
                };
            }
            if (chunk.usage) {
                yield {
                    type: "usage",
                    inputTokens: chunk.usage.prompt_tokens || 0,
                    outputTokens: chunk.usage.completion_tokens || 0,
                };
            }
        }
    }
    getModel() {
        return {
            id: this.options.openAiModelId ?? "",
            info: this.options.openAiModelInfo ?? api_1.openAiModelInfoSaneDefaults,
        };
    }
}
exports.OpenAiHandler = OpenAiHandler;
__decorate([
    (0, retry_1.withRetry)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Object)
], OpenAiHandler.prototype, "createMessage", null);
//# sourceMappingURL=openai.js.map