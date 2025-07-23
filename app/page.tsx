"use client"

import { AudioVisualizer } from "@/components/audio-visualizer"
import { DialogSystem } from "@/components/dialog-system"
import { useSessionStore } from "@/lib/stores/session-store"
import { useAudioPermissions } from "@/hooks/use-audio-permissions"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"

const queryClient = new QueryClient()

function RAGApp() {
  const { initializeSession } = useSessionStore()
  const { requestPermissions, hasPermissions } = useAudioPermissions()

  useEffect(() => {
    initializeSession()
    requestPermissions()
  }, [initializeSession, requestPermissions])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Audio Visualizer - Pulsating circles */}
      <div className="relative z-10">
        <AudioVisualizer hasPermissions={hasPermissions} />
      </div>

      {/* Dialog System */}
      <DialogSystem />

      {/* Permission status indicator */}
      {!hasPermissions && (
        <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-200 text-sm">
          Microphone access required
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <RAGApp />
    </QueryClientProvider>
  )
}
