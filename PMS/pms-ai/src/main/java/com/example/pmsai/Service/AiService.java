package com.example.pmsai.Service;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiService {
    /**
     * 调用模型接口，执行 prompt + message
     * @param prompt   指示模型行为
     * @param message  用户输入
     * @return 结果
     */
    @Autowired
    private OllamaChatModel ollamaChatModel;
    public String process(String prompt, String message) {
        // 拼接 prompt 和 message，模拟发送给模型
        String fullInput = prompt + ":\n" + message;

        String result = ollamaChatModel.call(prompt + ":" + message);

        return result;
    }

    /**
     * 模拟 Ollama/模型调用逻辑
     * @param input 模型输入
     * @return 模型输出
     */
    private String ollamaCall(String input) {

        System.out.println("【模型请求】\n" + input);

        // 假设这是模型返回
        return "【模拟响应】模型已处理输入 → " + input;
    }
}
