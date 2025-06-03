'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameSocket } from '@/hooks/useSocket'
import toast from 'react-hot-toast'

export default function GameLobby() {
    const { isConnected, roomInfo, playerRole, joinRoom, error } = useGameSocket()
    const [roomId, setRoomId] = useState<string>('')
    const [userId, setUserId] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const router = useRouter()

    const handleJoinRoom = () => {
        if (roomId.trim() && userId.trim() && username.trim()) {
            joinRoom(roomId, userId, username)
        }
    }

    const generateRoomId = () => {
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
        setRoomId(newRoomId)
    }

    useEffect(() => {
        if (roomInfo?.isReady) {
            toast.success('房間已滿，可以開始遊戲！')
            // 假設你有 roomInfo.roomId 與 username
            router.push(`/game/${roomInfo.roomId}?username=${encodeURIComponent(username)}`)
        }
    }, [roomInfo])

    return ((<div className="max-w-md mx-auto w-full bg-white rounded-lg shadow-lg p-3" >
        <h1 className="text-2xl text-blue-700 font-bold mb-4">Lobby</h1>

        {/* 連接狀態 */}
        <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {isConnected ? '● 已連接' : '● 未連接'}
            </span>
        </div>

        {
            !roomInfo ? (
                // 加入房間前的設定
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            用戶 ID
                        </label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                            placeholder="輸入你的用戶 ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 ">
                            用戶名稱
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                            placeholder="輸入你的名稱"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            房間 ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-black"
                                placeholder="輸入房間 ID"
                            />
                            <button
                                onClick={generateRoomId}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                隨機
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleJoinRoom}
                        disabled={!isConnected || !roomId.trim() || !userId.trim() || !username.trim()}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        加入房間
                    </button>
                </div>
            ) : (
                // 已在房間中
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800">房間資訊</h3>
                        <p className='text-black'>房間 ID: <span className="font-semibold text-blue-600">{roomInfo.roomId}</span></p>
                        <p className='text-black'>你的角色: <span className="font-semibold text-blue-600">{playerRole}</span></p>
                        <p className='text-black'> 人數: {roomInfo.userCount}/2</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2 text-blue-800">房間成員</h4>
                        <div className="space-y-2">
                            {roomInfo.users.map((user, index) => (
                                <div key={user.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="font-semibold text-blue-600">{user.username}</span>
                                    <span className="text-sm text-gray-500">
                                        玩家 {index + 1} {user.userId === userId && '(你)'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }
    </div >)
    )
}
