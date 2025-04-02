import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: "your-openai-key",
})

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export async function generateChatResponse(
  messages: ChatMessage[],
  noteContent?: string
) {
  try {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a helpful AI assistant. 
      Always focus on answering the current question directly and clearly.
      Use previous conversation context only as reference, but don't dwell on it.
      Keep your responses concise and to the point.
      If you're unsure about something, say so directly.`,
    }

    // 노트 내용을 마지막 메시지로 추가
    const allMessages = [
      systemMessage,
      ...messages,
      ...(noteContent ? [{
        role: "system" as const,
        content: `Current note content: ${noteContent}`
      }] : [])
    ]

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error("Error generating chat response:", error)
    throw error
  }
} 