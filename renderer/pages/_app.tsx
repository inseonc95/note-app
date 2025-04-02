import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from "../components/Layout"
import { NoteProvider } from "@/contexts/NoteContext"
import { ChatProvider } from "@/contexts/ChatContext"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoteProvider>
      <ChatProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChatProvider>
    </NoteProvider>
  )
} 