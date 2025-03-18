package com.example.pmsai.Controller;

import com.example.pmsai.Service.AiService;
import com.example.pmsai.model.AiRequest;
import com.example.pmsai.model.AiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    /**
     * 通用 AI 处理接口
     * @param request 用户请求体，包含 prompt + message
     * @return 处理后的结果
     */
    @PostMapping("/process")
    public AiResponse process(@RequestBody AiRequest request) {
        String prompt = request.getPrompt();
        String message = request.getMessage();

        String result = aiService.process(prompt, message);

        return new AiResponse(result);
    }
}
