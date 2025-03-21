// handler示例使用
import { CodeGenerationFramework } from "./handler";
async function main() {
    const userMessage = "Generate a function that returns the sum of two numbers.";
    const ApiProviderConfig = {
      apiProvider: "openai" as const,
      apiKey: "sk-IOMv20Q2hXNywuznWLZJEvCmG1SexZjevalacK6SF3Tys6m6",  // 替换真实API密钥
      baseURL: "https://api.chatgptsb.com/v1/",
      ModelId: "gpt-3.5-turbo",
    };
    const RequestConfig={
      temperature: 0.5,
      maxTokens: 4096,
    }
  

    
    const generator = new CodeGenerationFramework(ApiProviderConfig);
    
    const result = await generator.executeCodeGeneration(
      "帮我使用python语言写一个两个值相加的函数"
    );
    console.log( result);
  }
  
  main();
