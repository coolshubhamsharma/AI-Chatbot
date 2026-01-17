import type { NextApiRequest, NextApiResponse } from "next"
import { Server as IOServer } from "socket.io"
import Groq from "groq-sdk"
import type { NextSocketWithServer } from "@/lib/types"

// Required for Socket.IO
export const config = {
  api: { bodyParser: false },
}

// Force Node.js runtime
export const runtime = "nodejs"

// Groq client (initialized once)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export default function handler(_req: NextApiRequest,res: NextApiResponse): void {
  // Guard against unexpected runtime issues
  if (!res.socket) {
    res.status(500).end("Socket not available")
    return
  }

  // Next.js attaches the HTTP server at runtime,but TypeScript doesn't know about it.
  const socketWithServer = res.socket as unknown as NextSocketWithServer
  const server = socketWithServer.server

  // Initialize Socket.IO only once
  if (!server.io) {
    const io = new IOServer(server, {
      path: "/api/socket",
    })

    server.io = io
    
    //whenever a client connects it runs
    io.on("connection", socket => {
      socket.on("user-message", async (message: string) => {
        try {
          const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: message },
            ],
            stream: true,
          })

          // Stream tokens back to client
          let fullResponse = ""
          for await (const chunk of stream) {
            const choice = chunk.choices[0]
            // Normal streaming tokens
            if (choice?.delta?.content) {
              fullResponse += choice.delta.content
              socket.emit("ai-token", choice.delta.content)
            }
            // Model says it's done
            if (choice?.finish_reason === "stop") {
              break
            }
          }
          // In rare cases, the last part is not streamed token-by-token
          if (fullResponse.length > 0) {
            socket.emit("ai-token", "")
          }
          socket.emit("ai-done")

        } catch (error) {
          socket.emit("ai-error",error)
        }
      })
    })
  }

  res.end()
}
