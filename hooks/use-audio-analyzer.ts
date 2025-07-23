"use client"

import { useState, useEffect, useRef } from "react"

export function useAudioAnalyzer(hasPermissions: boolean) {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!hasPermissions) return

    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext

        const analyzer = audioContext.createAnalyser()
        analyzer.fftSize = 256
        analyzerRef.current = analyzer

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyzer)

        setIsActive(true)
        startAnalyzing()
      } catch (error) {
        console.error("Failed to initialize audio:", error)
      }
    }

    const startAnalyzing = () => {
      if (!analyzerRef.current) return

      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)

      const analyze = () => {
        if (!analyzerRef.current) return

        analyzerRef.current.getByteFrequencyData(dataArray)

        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1

        setAudioLevel(normalizedLevel)
        animationFrameRef.current = requestAnimationFrame(analyze)
      }

      analyze()
    }

    initializeAudio()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      setIsActive(false)
    }
  }, [hasPermissions])

  return { audioLevel, isActive }
}
