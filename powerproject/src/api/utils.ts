import { ApiConfiguration } from "../shared/api";
import { Anthropic } from "@anthropic-ai/sdk";

export function genPrompt(
    taskType: string,
    userMessage: string,
    options?: { language?: string }
): { systemPrompt: string, messageParams: Anthropic.Messages.MessageParam[] } {
    // 设置默认值
    let systemprompt = "You are a helpful AI assistant.";
    let messageparams: Anthropic.Messages.MessageParam[] = [];

    switch (taskType) {
        case "completecode":
            systemprompt = "You are a helpful AI assistant that generates code. Complete the following code for me. Don't explain, just return the code. You should write the best replacement for placeholder {write code here} in the text. Include change line if needed.";
            messageparams = [{ role: "user", content: userMessage }];
    }
    return {
        systemPrompt: systemprompt,
        messageParams: messageparams, 
    };
}

export function  extractCode(text: string): string {
    const codeRegex = /```[^\n]*\r?\n([\s\S]*?)```/;
    const match = text.match(codeRegex);
    if(match && match[1]) {
        return match[1];
    } 
    return text;
}