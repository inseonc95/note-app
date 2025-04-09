import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from "../components/Layout"
import { NoteProvider } from "@/contexts/NoteContext"
import { ChatProvider } from "@/contexts/ChatContext"
import { ChatUIProvider } from "@/contexts/ChatUIContext"
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChatUIProvider>
    <ChatProvider>
      <NoteProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NoteProvider>
    </ChatProvider>
    </ChatUIProvider>
  )
} 