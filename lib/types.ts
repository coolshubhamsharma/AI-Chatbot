import type { Server as HTTPServer } from "http"
import type { Server as IOServer } from "socket.io"

export type NextSocketWithServer = {
  server: HTTPServer & {
    io?: IOServer
  }
}


export type Message = {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: number
}
