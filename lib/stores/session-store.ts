import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SessionState {
  sessionKey: string | null
  isInitialized: boolean
  initializeSession: () => void
  getSessionKey: () => string
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionKey: null,
      isInitialized: false,

      initializeSession: () => {
        const state = get()
        if (!state.sessionKey) {
          const newSessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          set({ sessionKey: newSessionKey, isInitialized: true })
        } else {
          set({ isInitialized: true })
        }
      },

      getSessionKey: () => {
        const state = get()
        return state.sessionKey || "default_session"
      },
    }),
    {
      name: "rag-session-storage",
      partialize: (state) => ({ sessionKey: state.sessionKey }),
    },
  ),
)
