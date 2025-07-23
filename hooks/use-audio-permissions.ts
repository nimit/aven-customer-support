"use client"

import { useState, useCallback } from "react"

export function useAudioPermissions() {
  const [hasPermissions, setHasPermissions] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  const requestPermissions = useCallback(async () => {
    if (isRequesting) return

    setIsRequesting(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach((track) => track.stop())

      setHasPermissions(true)
    } catch (error) {
      console.error("Failed to get microphone permissions:", error)
      setHasPermissions(false)
    } finally {
      setIsRequesting(false)
    }
  }, [isRequesting])

  return {
    hasPermissions,
    isRequesting,
    requestPermissions,
  }
}
