"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApiHandler = buildApiHandler;
const anthropic_1 = require("./providers/anthropic");
const openai_1 = require("./providers/openai");
function buildApiHandler(configuration) {
    const { apiProvider, ...options } = configuration;
    switch (apiProvider) {
        case "openai":
            return new openai_1.OpenAiHandler(options);
        default:
            return new anthropic_1.AnthropicHandler(options);
    }
}
//# sourceMappingURL=index.js.map