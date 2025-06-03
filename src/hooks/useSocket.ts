import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
    user: string
    text: string
    timestamp: number
}

interface UserInfo {
    userId: string
    username: string
    joinTime: number
}

interface RoomInfo {
    roomId: string
    userCount: number
    users: UserInfo[]
    isReady: boolean
}

interface UseSocketReturn {
    socket: Socket | null
    isConnected: boolean
    messages: Message[]
    sendMessage: (user: string, text: string) => void
    clearMessages: () => void
}

interface UseGameSocketReturn {
    socket: Socket | null
    isConnected: boolean
    roomInfo: RoomInfo | null
    playerRole: 'player1' | 'player2' | null
    joinRoom: (roomId: string, userId: string, username: string) => void
    sendGameAction: (action: any) => void
    error: string | null
}

export const useSocket = (serverPath: string = ''): UseSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        // 連接到 Socket.IO 伺服器
        const socketIO = io(serverPath)

        console.log(socket, "useSocket.ts");


        socketIO.on('connect', () => {
            console.log('WebSocket 已連接，ID:', socketIO.id)
            setIsConnected(true)
        })

        socketIO.on('disconnect', () => {
            console.log('WebSocket 已斷線')
            setIsConnected(false)
        })

        socketIO.on('message', (data: Message) => {
            console.log('收到新訊息:', data)
            setMessages(prev => [...prev, data])
        })

        setSocket(socketIO)

        return () => {
            socketIO.disconnect()
        }
    }, [serverPath])

    const sendMessage = useCallback((user: string, text: string): void => {
        if (socket && isConnected && text.trim()) {
            const message: Message = {
                user,
                text,
                timestamp: Date.now()
            }

            // 發送到伺服器
            socket.emit('message', message)

            // 添加到本地訊息列表（自己的訊息）
            setMessages(prev => [...prev, { ...message, user: `${user} (你)` }])
        }
    }, [socket, isConnected])

    const clearMessages = useCallback((): void => {
        setMessages([])
    }, [])

    return { socket, isConnected, messages, sendMessage, clearMessages }
}

export const useGameSocket = (): UseGameSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
    const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const socketIO = io()

        socketIO.on('connect', () => {
            console.log('遊戲 Socket 已連接')
            setIsConnected(true)
        })

        socketIO.on('disconnect', () => {
            console.log('遊戲 Socket 已斷線')
            setIsConnected(false)
        })

        // 加入房間成功
        socketIO.on('joinSuccess', (data: { roomId: string, playerRole: 'player1' | 'player2', roomInfo: RoomInfo }) => {
            console.log('加入房間成功:', data)
            setPlayerRole(data.playerRole)
            setRoomInfo(data.roomInfo)
            setError(null)
        })

        // 加入房間失敗
        socketIO.on('joinError', (data: { message: string }) => {
            console.log('加入房間失敗:', data.message)
            setError(data.message)
        })

        // 有用戶加入
        socketIO.on('userJoined', (data: { user: UserInfo, roomInfo: RoomInfo }) => {
            console.log('有新用戶加入:', data.user)
            setRoomInfo(data.roomInfo)
        })

        // 有用戶離開
        socketIO.on('userLeft', (data: { user: UserInfo, roomInfo: RoomInfo }) => {
            console.log('有用戶離開:', data.user)
            setRoomInfo(data.roomInfo)
        })

        // 遊戲更新
        socketIO.on('gameUpdate', (data: { action: any, fromUser: UserInfo, roomInfo: RoomInfo }) => {
            console.log('遊戲更新:', data)
            // 這裡之後會處理遊戲邏輯
        })

        setSocket(socketIO)

        return () => {
            socketIO.disconnect()
        }
    }, [])

    const joinRoom = useCallback((roomId: string, userId: string, username: string) => {
        if (socket && isConnected) {
            socket.emit('joinRoom', { roomId, userId, username })
        }
    }, [socket, isConnected])

    const sendGameAction = useCallback((action: any) => {
        if (socket && isConnected && roomInfo) {
            socket.emit('gameAction', { roomId: roomInfo.roomId, action })
        }
    }, [socket, isConnected, roomInfo])

    return {
        socket,
        isConnected,
        roomInfo,
        playerRole,
        joinRoom,
        sendGameAction,
        error
    }
}
