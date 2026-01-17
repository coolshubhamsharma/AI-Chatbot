"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type ChatInputProps = {
  onSend: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")

  function sendMessage() {
    if (!message.trim()) return
    onSend(message)
    setMessage("")
  }

  return (
    <div className="flex items-center gap-3 border-t bg-white p-3">
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        disabled={disabled}
        placeholder="Type a message..."
        className="flex-1 rounded-full border px-4 py-2 text-sm
        bg-white text-gray-900
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
        dark:placeholder-gray-400
        "
      />

      <motion.button
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={sendMessage}
        disabled={disabled}
        className="
          rounded-full hover:cursor-pointer bg-blue-600 px-5 py-2 text-sm font-medium text-white
          transition-colors hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        Send
      </motion.button>
    </div>
  )
}
