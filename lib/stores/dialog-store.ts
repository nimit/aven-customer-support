import { create } from "zustand"

export interface DialogMessage {
  id: string
  text: string
  timestamp: number
  isStreaming: boolean
}

interface DialogState {
  dialogs: DialogMessage[]
  addText: (text: string) => void
  updateStreamingText: (id: string, text: string) => void
  completeStreaming: (id: string) => void
  clearOldDialogs: () => void
}

const DIALOG_TIMEOUT = 5000 // 5 seconds
const MAX_DIALOGS = 5
const CHARACTER_LIMIT = 120

export const useDialogStore = create<DialogState>((set, get) => ({
  dialogs: [],

  addText: (text: string) => {
    const now = Date.now()
    const state = get()
    const lastDialog = state.dialogs[state.dialogs.length - 1]

    // Create new dialog if:
    // 1. No previous dialog exists
    // 2. Last dialog was more than DIALOG_TIMEOUT ago
    // 3. Adding this text would exceed CHARACTER_LIMIT
    const shouldCreateNewDialog =
      !lastDialog ||
      now - lastDialog.timestamp > DIALOG_TIMEOUT ||
      lastDialog.text.length + text.length > CHARACTER_LIMIT

    if (shouldCreateNewDialog) {
      const newDialog: DialogMessage = {
        id: `dialog_${now}_${Math.random().toString(36).substring(2, 11)}`,
        text,
        timestamp: now,
        isStreaming: false,
      }

      set((state) => ({
        dialogs: [...state.dialogs.slice(-MAX_DIALOGS + 1), newDialog],
      }))
    } else {
      // Add to existing dialog with streaming effect
      const streamingId = `stream_${now}_${Math.random().toString(36).substring(2, 11)}`
      const streamingDialog: DialogMessage = {
        id: streamingId,
        text,
        timestamp: now,
        isStreaming: true,
      }

      set((state) => ({
        dialogs: [...state.dialogs, streamingDialog],
      }))

      // Simulate streaming effect
      setTimeout(() => {
        get().completeStreaming(streamingId)
      }, 100)
    }
  },

  updateStreamingText: (id: string, text: string) => {
    set((state) => ({
      dialogs: state.dialogs.map((dialog) => (dialog.id === id ? { ...dialog, text } : dialog)),
    }))
  },

  completeStreaming: (id: string) => {
    set((state) => ({
      dialogs: state.dialogs.map((dialog) => (dialog.id === id ? { ...dialog, isStreaming: false } : dialog)),
    }))
  },

  clearOldDialogs: () => {
    const now = Date.now()
    set((state) => ({
      dialogs: state.dialogs.filter((dialog) => now - dialog.timestamp < 30000), // Keep for 30 seconds
    }))
  },
}))
