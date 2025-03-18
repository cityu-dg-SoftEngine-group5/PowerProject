package com.example.pmsai.model;

public class AiRequest {
    private String prompt;   // 说明模型行为
    private String message;  // 需要处理的内容

    public AiRequest() {}

    public AiRequest(String prompt, String message) {
        this.prompt = prompt;
        this.message = message;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
