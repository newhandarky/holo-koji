import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface UserInfo {
    userId: string
    username: string
    joinTime: number
}

export interface RoomInfo {
    roomId: string
    userCount: number
    users: UserInfo[]
    isReady: boolean
}

export interface UseGameSocketReturn {
    socket: Socket | null
    isConnected: boolean
    roomInfo: RoomInfo | null
    playerRole: 'player1' | 'player2' | null
    joinRoom: (roomId: string, userId: string, username: string) => void
    sendGameAction: (action: string) => void
    error: string | null
}

export const useGameSocket = (roomId?: string): UseGameSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
    const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const socketIO = io()

        socketIO.on('connect', () => {
            setIsConnected(true)
        })

        socketIO.on('disconnect', () => {
            setIsConnected(false)
        })

        socketIO.on('joinSuccess', (data: { roomId: string, playerRole: 'player1' | 'player2', roomInfo: RoomInfo }) => {
            setPlayerRole(data.playerRole)
            setRoomInfo(data.roomInfo)
            setError(null)
        })

        socketIO.on('joinError', (data: { message: string }) => {
            setError(data.message)
        })

        socketIO.on('userJoined', (data: { user: UserInfo, roomInfo: RoomInfo }) => {
            setRoomInfo(data.roomInfo)
        })

        socketIO.on('userLeft', (data: { user: UserInfo, roomInfo: RoomInfo }) => {
            setRoomInfo(data.roomInfo)
        })

        socketIO.on('gameUpdate', (data: { action: string, fromUser: UserInfo, roomInfo: RoomInfo }) => {
            // 遊戲狀態更新
            console.log('遊戲狀態更新:', data);

        })

        setSocket(socketIO)

        // 離開房間或切換 roomId 時自動斷線
        return () => {
            socketIO.disconnect()
        }
    }, [roomId])

    // 只有在有 socket 且已連線時才可以 joinRoom
    const joinRoom = useCallback((roomId: string, userId: string, username: string) => {
        if (socket && isConnected) {
            socket.emit('joinRoom', { roomId, userId, username })
        }
    }, [socket, isConnected])

    const sendGameAction = useCallback((action: string) => {
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