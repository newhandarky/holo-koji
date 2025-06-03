'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/hooks/useSocket'

export default function ChatRoom() {
    const { isConnected, messages, sendMessage, clearMessages } = useSocket()
    const [input, setInput] = useState<string>('')
    const [username, setUsername] = useState<string>('訪客')

    const handleSend = (): void => {
        if (input.trim() && username.trim()) {
            sendMessage(username, input)
            setInput('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    useEffect(() => {
        if (messages.length > 0) {
            console.log(messages, "ChatRoom.tsx");
        }
    }, [messages])

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4 text-blue-700">WebSocket</h1>

            {/* 連接狀態 */}
            <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {isConnected ? '● 已連接' : '● 未連接'}
                </span>
            </div>

            {/* 使用者名稱 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    使用者名稱
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700"
                    placeholder="輸入你的名稱"
                />
            </div>

            {/* 訊息區域 */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-blue-700">訊息</h3>
                    <button
                        onClick={clearMessages}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        清除
                    </button>
                </div>
                <div className="h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-center">還沒有訊息...</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-2 flex flex-col">
                                <div className="flex text-xs text-gray-500">
                                    <span className='mr-2'>{msg.user}</span>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-gray-800">{msg.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 輸入區域 */}
            <div className="flex gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入訊息..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-blue-700"
                    rows={2}
                />
                <button
                    onClick={handleSend}
                    disabled={!isConnected || !input.trim() || !username.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    發送
                </button>
            </div>
        </div>
    )
}
