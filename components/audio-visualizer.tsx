"use client"

import { useAudioAnalyzer } from "@/hooks/use-audio-analyzer"
import { motion } from "framer-motion"

interface AudioVisualizerProps {
  hasPermissions: boolean
}

export function AudioVisualizer({ hasPermissions }: AudioVisualizerProps) {
  const { audioLevel, isActive } = useAudioAnalyzer(hasPermissions)

  const baseScale = 1
  const audioScale = 1 + audioLevel * 0.5 // Scale based on audio level

  return (
    <div className="relative flex items-center justify-center">
      {/* Outermost circle */}
      <motion.div
        className="absolute rounded-full border-2 border-purple-400/30"
        style={{
          width: 300,
          height: 300,
        }}
        animate={{
          scale: [baseScale, baseScale + 0.1, baseScale],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Middle circle */}
      <motion.div
        className="absolute rounded-full border-2 border-purple-300/50"
        style={{
          width: 200,
          height: 200,
        }}
        animate={{
          scale: [baseScale, baseScale + 0.15, baseScale],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Inner circle - responds to audio */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        style={{
          width: 100,
          height: 100,
        }}
        animate={{
          scale: isActive ? audioScale : [baseScale, baseScale + 0.2, baseScale],
          opacity: [0.6, 1, 0.6],
        }}
        transition={
          isActive
            ? {
                duration: 0.1,
                ease: "easeOut",
              }
            : {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }
        }
      />

      {/* Center dot */}
      <motion.div
        className="relative rounded-full bg-white"
        style={{
          width: 20,
          height: 20,
        }}
        animate={{
          scale: isActive ? 1 + audioLevel * 0.3 : [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={
          isActive
            ? {
                duration: 0.1,
                ease: "easeOut",
              }
            : {
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1.5,
              }
        }
      />

      {/* Music-style frequency visualization */}
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-4 pointer-events-none z-0">
          {Array.from({ length: 64 }).map((_, index) => {
            const frequency = Math.sin((index * Math.PI) / 32) * audioLevel * 0.8 + audioLevel * 0.2
            const height = Math.max(4, frequency * 120)
            return (
              <motion.div
                key={index}
                className="bg-gradient-to-t from-purple-500/40 via-pink-500/30 to-transparent rounded-t-sm"
                style={{
                  width: "2px",
                  height: `${height}px`,
                }}
                animate={{
                  height: `${height}px`,
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 0.1,
                  opacity: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: index * 0.05,
                  },
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
