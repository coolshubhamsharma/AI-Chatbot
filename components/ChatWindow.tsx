"use client"

import { useEffect, useRef, useState } from "react"
import { Message } from "@/lib/types"
import { socket } from "@/lib/socket"
import ChatInput from "./ChatInput"
import ChatMessage from "./ChatMessage"

export default function ChatWindow() {
  /* -------------------- state -------------------- */

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("chat")
    return stored ? JSON.parse(stored) : []
  })

  const [isStreaming, setIsStreaming] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null) //autoscroll to the latest message


  // index of the current AI message being streamed
  const aiMessageIndexRef = useRef<number | null>(null)


  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  // -----  Persistence  -------
  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(messages))
  }, [messages])


  // ---------  Socket Listeners  ----------
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id)
    })

    socket.on("ai-token", (token: string) => {
      setShowTyping(false)

      setMessages(prev => {
        const index = aiMessageIndexRef.current
        if (index === null) return prev

        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          content: updated[index].content + token,
        }
        return updated
      })
    })

    socket.on("ai-done", () => {
      setIsStreaming(false)
      setShowTyping(false)
      aiMessageIndexRef.current = null
    })

    socket.on("ai-error", () => {
      setIsStreaming(false)
      setShowTyping(false)
      aiMessageIndexRef.current = null
    })

    return () => {
      socket.off("connect")
      socket.off("ai-token")
      socket.off("ai-done")
      socket.off("ai-error")
    }
  }, [])

  
  // ----------  Actions  ----------
  function sendMessage(text: string) {
    if (isStreaming) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    }

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content: "",
      timestamp: Date.now(),
    }

    setMessages(prev => {
      const next = [...prev, userMessage, aiMessage]
      aiMessageIndexRef.current = next.length - 1
      return next
    })

    setIsStreaming(true)
    setShowTyping(true)

    console.log("📤 Emitting user-message:", text)
    socket.emit("user-message", text)
  }

  function clearChat() {
    setMessages([])
    localStorage.removeItem("chat")
    setIsStreaming(false)
    setShowTyping(false)
    aiMessageIndexRef.current = null
  }


  return (
    <div className={`w-full max-w-2xl h-[80vh] rounded shadow flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="font-semibold">AI Chat</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="text-sm"
          >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>

          <button
            onClick={clearChat}
            className="text-sm text-red-500 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {showTyping && (
          <div className="text-sm text-gray-400 mt-2">
            AI is typing…
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
