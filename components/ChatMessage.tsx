"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Message } from "@/lib/types"

type ChatMessageProps = {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  function copyMessage() {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md"
        }`}
      >
        {/* Message body */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        {/* Copy button (AI only) */}
        {!isUser && (
          <button
            onClick={copyMessage}
            aria-label="Copy message"
            className="absolute top-2 right-2 text-xs opacity-50 transition hover:opacity-100"
          >
            📋
          </button>
        )}

        {/* Copy feedback */}
        {copied && (
          <div className="absolute -top-6 right-0 rounded bg-black px-2 py-1 text-xs text-white">
            Copied
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-1 text-[10px] opacity-60 text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}
