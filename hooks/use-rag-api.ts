import { useQuery, useMutation } from "@tanstack/react-query"
import { useSessionStore } from "@/lib/stores/session-store"

interface RAGRequest {
  query: string
  sessionKey: string
}

interface RAGResponse {
  response: string
  sources?: string[]
  sessionKey: string
}

// Example API functions - replace with your actual endpoints
const ragApi = {
  query: async (request: RAGRequest): Promise<RAGResponse> => {
    // Replace with your actual API endpoint
    const response = await fetch("https://api.example.com/rag/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error("Failed to query RAG API")
    }

    return response.json()
  },
}

export function useRAGQuery() {
  const { getSessionKey } = useSessionStore()

  return useMutation({
    mutationFn: (query: string) =>
      ragApi.query({
        query,
        sessionKey: getSessionKey(),
      }),
    onError: (error) => {
      console.error("RAG API Error:", error)
    },
  })
}

export function useRAGSession() {
  const { getSessionKey } = useSessionStore()

  return useQuery({
    queryKey: ["rag-session", getSessionKey()],
    queryFn: async () => {
      // Example session validation endpoint
      const response = await fetch(`https://api.example.com/rag/session/${getSessionKey()}`)
      return response.json()
    },
    enabled: false, // Only run when explicitly called
    retry: false,
  })
}
