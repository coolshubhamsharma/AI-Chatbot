import { io } from "socket.io-client"

export const socket = io("https://ai-chatbot-opal-one-58.vercel.app", {
  path: "/api/socket",
})
