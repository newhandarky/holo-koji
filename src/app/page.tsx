// import ChatRoom from '@/components/ChatRoom'
import GameLobby from '@/components/GameLobby'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-3">
      {/* <ChatRoom /> */}
      <GameLobby />
    </main>
  )
}
