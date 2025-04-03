import OpenAI from "openai"
import { ChatMessage } from "../lib/types"



export class OpenAIService {
  private static instance: OpenAIService;
  private openai: OpenAI | null = null;

  private constructor() {
    // 생성자에서는 API 키를 로드하지 않음
  }

  static getInstance() {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  // API 키 설정 메서드 추가
  setApiKey(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // API 키 유효성 검사
  async validateApiKey(apiKey: string) {
    const openai = new OpenAI({ apiKey });
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 1
    });
    return true;
  }

  private createSystemMessage(messages: ChatMessage[], noteContent?: string) {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a helpful AI assistant. 
      Always focus on answering the current question directly and clearly.
      Use previous conversation context only as reference, but don't dwell on it.
      Keep your responses concise and to the point.
      If you're unsure about something, say so directly.`,
    }

    return [systemMessage, ...messages, ...(noteContent ? [{
      role: "system" as const,
      content: `Current note content: ${noteContent}`
    }] : [])]
  }
  
  async generateChatResponse(
    messages: ChatMessage[],
    noteContent?: string
  ) {
    if (!this.openai) {
      throw new Error("API key not set");
    }
    
    try {
      const allMessages = this.createSystemMessage(messages, noteContent)
  
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 500,
      })
  
      return response.choices[0].message.content
    } catch (error) {
      throw error
    }
  } 
}

