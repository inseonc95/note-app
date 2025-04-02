import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
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
      content: `You are a helpful AI assistant that helps users with their notes. 
      ${noteContent ? `The current note content is: ${noteContent}` : ""}
      Please provide helpful and concise responses.`,
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error("Error generating chat response:", error)
    throw error
  }
} 