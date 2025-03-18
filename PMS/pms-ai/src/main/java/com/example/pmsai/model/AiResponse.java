package com.example.pmsai.model;

public class AiResponse {
    private String result;  // 处理后的结果

    public AiResponse() {}

    public AiResponse(String result) {
        this.result = result;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}
