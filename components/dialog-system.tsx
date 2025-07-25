"use client";

import { useDialogStore } from "@/lib/stores/dialog-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Parameterized number of visible dialogs
const MAX_VISIBLE_DIALOGS = 3;

export function DialogSystem() {
  const { dialogs, addText, clearOldDialogs } = useDialogStore();

  // Demo function to add text - you can call this from your audio transcription
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldDialogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [clearOldDialogs]);

  // Demo: Add some sample text every 10 seconds
  useEffect(() => {
    const demoTexts = [
      "Hello, how can I help you today?",
      "I'm processing your request...",
      "Here's what I found in the knowledge base.",
      "Would you like me to explain this further?",
      "Let me search for more information.",
    ];

    let index = 1;
    const interval = setInterval(() => {
      addText(demoTexts[index % demoTexts.length]);
      index++;
    }, 5000);

    // Add initial text
    const timeoutId = setTimeout(() => addText(demoTexts[0]), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [addText]);

  // Only show the specified number of most recent dialogs
  const visibleDialogs = dialogs.slice(-MAX_VISIBLE_DIALOGS).reverse();

  return (
    <div className="fixed top-0 right-0 bottom-0 w-96 pointer-events-none flex flex-col-reverse justify-start items-end p-8 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {visibleDialogs.map((dialog, index) => (
          <DialogBox
            key={dialog.id}
            dialog={dialog}
            isLatest={index === 0}
            position={index}
            total={visibleDialogs.length}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface DialogBoxProps {
  dialog: {
    id: string;
    text: string;
    timestamp: number;
    isStreaming: boolean;
  };
  isLatest: boolean;
  position: number;
  total: number;
}

function DialogBox({ dialog, isLatest, position, total }: DialogBoxProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -50,
        scale: 0.9,
        transition: { duration: 0.2 },
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 1,
      }}
      className={`w-full max-w-xs mb-3 origin-bottom`}
    >
      <div
        className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-5 py-3 shadow-lg shadow-purple-500/10"
        style={{
          opacity: Math.max(0.7, 1 - position * 0.15), // Fade out older messages slightly
        }}
      >
        <StreamingText
          text={dialog.text}
          isStreaming={dialog.isStreaming}
          isLatest={isLatest}
        />
      </div>
    </motion.div>
  );
}

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  isLatest: boolean;
}

function StreamingText({ text, isStreaming, isLatest }: StreamingTextProps) {
  // Limit text length to prevent overflow
  const displayText = text.length > 120 ? text.substring(0, 120) + "..." : text;

  return (
    <div className="text-white text-sm">
      {isStreaming && isLatest ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {displayText.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: index * 0.02,
                duration: 0.1,
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      ) : (
        <span className="break-words">{displayText}</span>
      )}

      {isStreaming && isLatest && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="ml-1 text-purple-400"
        >
          |
        </motion.span>
      )}
    </div>
  );
}

// Export function to add text from outside components
export function addDialogText(text: string) {
  useDialogStore.getState().addText(text);
}
