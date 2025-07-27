"use client";

import { AudioVisualizer } from "@/components/audio-visualizer";
import { DialogSystem } from "@/components/dialog-system";
import { useSessionStore } from "@/lib/stores/session-store";
import { useAudioPermissions } from "@/hooks/use-audio-permissions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

function RAGApp() {
  const { initializeSession } = useSessionStore();
  const { requestPermissions, hasPermissions } = useAudioPermissions();

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<
    Array<{ role: string; text: string }>
  >([]);

  useEffect(() => {
    initializeSession();
    requestPermissions();
  }, [initializeSession, requestPermissions]);

  useEffect(() => {
    // console.log("VAPI PUBLIC API KEY", process.env["NEXT_PUBLIC_VAPI_KEY"]);
    const vapiInstance = new Vapi(process.env["NEXT_PUBLIC_VAPI_KEY"]!);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on("call-start", () => {
      console.log("Call started");
      setIsConnected(true);
      setTranscript([]);
    });

    vapiInstance.on("call-end", () => {
      console.log("Call ended");
      setIsConnected(false);
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      console.log("Assistant started speaking");
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      console.log("Assistant stopped speaking");
      setIsSpeaking(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type !== "transcript") return;
      setTranscript((prev) => {
        const prevLength = prev.length;
        console.dir(prev);
        console.dir(message);
        if (
          prevLength &&
          prev[prevLength - 1].role == message.role &&
          message.transcript
            .toLowerCase()
            .startsWith(prev[prevLength - 1].text.toLowerCase())
        ) {
          return [
            ...prev.slice(0, -1),
            {
              role: message.role,
              text: message.transcript,
            },
          ];
        }
        return [
          ...prev,
          {
            role: message.role,
            text: message.transcript,
          },
        ];
      });
    });

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, []);

  const startCall = () => {
    console.log("startCall called");
    if (vapi) {
      // console.log(
      //   "STARTING WORKFLOW ID: ",
      //   process.env["NEXT_PUBLIC_VAPI_WORKFLOW"]
      // );
      vapi.start(
        undefined,
        undefined,
        undefined,
        process.env["NEXT_PUBLIC_VAPI_WORKFLOW"]!
      );
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      {isConnected && (
        <div>
          <div className="relative z-10">
            <AudioVisualizer
              hasPermissions={hasPermissions}
              assistantSpeaking={isSpeaking}
            />
          </div>

          <DialogSystem transcript={transcript} />
          <Button className="z-10 absolute top-5 right-5" onClick={endCall}>
            End Call
          </Button>
        </div>
      )}
      {hasPermissions && !isConnected && (
        <Button className="z-10" onClick={startCall}>
          Start Call
        </Button>
      )}
      {!hasPermissions && (
        <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-200 text-sm">
          Microphone access required
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <RAGApp />
    </QueryClientProvider>
  );
}
