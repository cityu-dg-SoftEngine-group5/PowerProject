"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateApiCostAnthropic = calculateApiCostAnthropic;
function calculateApiCostInternal(modelInfo, inputTokens, outputTokens, cacheCreationInputTokens, cacheReadInputTokens) {
    const cacheWritesCost = ((modelInfo.cacheWritesPrice || 0) / 1_000_000) * cacheCreationInputTokens;
    const cacheReadsCost = ((modelInfo.cacheReadsPrice || 0) / 1_000_000) * cacheReadInputTokens;
    const baseInputCost = ((modelInfo.inputPrice || 0) / 1_000_000) * inputTokens;
    const outputCost = ((modelInfo.outputPrice || 0) / 1_000_000) * outputTokens;
    const totalCost = cacheWritesCost + cacheReadsCost + baseInputCost + outputCost;
    return totalCost;
}
// For Anthropic compliant usage, the input tokens count does NOT include the cached tokens
function calculateApiCostAnthropic(modelInfo, inputTokens, outputTokens, cacheCreationInputTokens, cacheReadInputTokens) {
    const cacheCreationInputTokensNum = cacheCreationInputTokens || 0;
    const cacheReadInputTokensNum = cacheReadInputTokens || 0;
    return calculateApiCostInternal(modelInfo, inputTokens, outputTokens, cacheCreationInputTokensNum, cacheReadInputTokensNum);
}
//# sourceMappingURL=cost.js.map