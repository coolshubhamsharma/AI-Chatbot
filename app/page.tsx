import ChatClient from "./chat-client"

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <ChatClient />
      </div>
    </main>
  )
}
