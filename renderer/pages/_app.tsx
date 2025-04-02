import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from "../components/Layout"
import { NoteProvider } from "@/contexts/NoteContext"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoteProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NoteProvider>
  )
} 