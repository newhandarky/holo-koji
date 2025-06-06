import { shuffle } from 'lodash'

import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { Geisha, Card, GameRoom, UserInfo, Players, } from '../types/game/hanamikoji'
import toast from 'react-hot-toast'



class SocketManager {
    private static instance: SocketManager
    private _io: SocketIOServer | null = null
    private rooms: Map<string, GameRoom> = new Map()  // 房間管理
    private userSocketMap: Map<string, string> = new Map()  // userId -> socketId

    private constructor() { }

    static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager()
        }
        return SocketManager.instance
    }

    initializeIO(httpServer: HttpServer): SocketIOServer {
        if (this._io) {
            console.log('Socket.IO 已經初始化')
            return this._io
        }

        this._io = new SocketIOServer(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        })

        this._io.on('connection', (socket: Socket) => {
            console.log('新客戶端連接:', socket.id)

            socket.on('message', (data: { user: string; text: string }) => {
                console.log('收到訊息:', data)
                // 廣播給所有其他客戶端
                socket.broadcast.emit('message', data)
            })

            // 用戶加入房間
            socket.on('joinRoom', (data: { roomId: string, userId: string, username: string }) => {
                this.handleJoinRoom(socket, data)
            })

            // 用戶發送遊戲動作
            socket.on('gameAction', (data: { roomId: string, action: string }) => {
                this.handleGameAction(socket, data)
            })

            socket.on('disconnect', () => {
                console.log('客戶端斷線:', socket.id)
            })
        })

        console.log('Socket.IO 伺服器已啟動')
        return this._io
    }

    private handleJoinRoom(socket: Socket, data: { roomId: string, userId: string, username: string }) {
        const { roomId, userId, username } = data

        // 檢查房間是否存在
        let room = this.rooms.get(roomId)
        if (!room) {
            // 創建新房間
            room = {
                roomId,
                users: [],
                createdAt: Date.now()
            }
            this.rooms.set(roomId, room)
        }

        // 檢查房間人數限制（兩人）
        if (room.users.length >= 2) {
            socket.emit('joinError', { message: '房間已滿，最多只能 2 人遊戲' })
            return
        }

        // 檢查用戶是否已在房間中
        const existingUser = room.users.find(user => user.userId === userId)
        if (existingUser) {
            socket.emit('joinError', { message: '你已經在這個房間中了' })
            return
        }

        // 加入房間
        const userInfo: UserInfo = {
            socketId: socket.id,
            userId,
            username,
            joinTime: Date.now()
        }

        room.users.push(userInfo)
        this.userSocketMap.set(userId, socket.id)
        socket.join(roomId)

        // 確定用戶角色（第一個加入的是玩家1，第二個是玩家2）
        const playerRole = room.users.length === 1 ? 'player1' : 'player2'

        // 通知用戶加入成功
        socket.emit('joinSuccess', {
            roomId,
            playerRole,
            roomInfo: this.getRoomInfo(roomId)
        })

        // 通知房間內其他用戶
        socket.to(roomId).emit('userJoined', {
            user: userInfo,
            roomInfo: this.getRoomInfo(roomId)
        })

        toast(`用戶 ${username}(${userId}) 作為 ${playerRole} 加入房間 ${roomId}`)
        console.log(`用戶 ${username}(${userId}) 作為 ${playerRole} 加入房間 ${roomId}`)
    }

    private handleGameAction(socket: Socket, data: { roomId: string, action: string }) {
        const room = this.rooms.get(data.roomId)
        if (!room) return

        // 找到執行動作的用戶
        const user = room.users.find(u => u.socketId === socket.id)
        if (!user) return

        // 廣播遊戲動作給房間內所有用戶
        this._io?.to(data.roomId).emit('gameUpdate', {
            action: data.action,
            fromUser: user,
            roomInfo: this.getRoomInfo(data.roomId)
        })
    }

    private handleDisconnect(socket: Socket) {
        console.log('客戶端斷線:', socket.id)

        // 找到斷線用戶並從房間移除
        for (const [roomId, room] of this.rooms.entries()) {
            const userIndex = room.users.findIndex(u => u.socketId === socket.id)
            if (userIndex !== -1) {
                const user = room.users[userIndex]
                room.users.splice(userIndex, 1)
                this.userSocketMap.delete(user.userId)

                // 通知房間內其他用戶
                socket.to(roomId).emit('userLeft', {
                    user,
                    roomInfo: this.getRoomInfo(roomId)
                })

                // 如果房間空了就刪除
                if (room.users.length === 0) {
                    this.rooms.delete(roomId)
                }
                break
            }
        }
    }

    private getRoomInfo(roomId: string) {
        const room = this.rooms.get(roomId)
        if (!room) return null

        return {
            roomId: room.roomId,
            userCount: room.users.length,
            users: room.users.map(u => ({
                userId: u.userId,
                username: u.username,
                joinTime: u.joinTime
            })),
            isReady: room.users.length === 2
        }
    }

    private initializeHanamikojiGame(roomId: string): void {
        const room = this.rooms.get(roomId)
        if (!room || room.users.length !== 2) return

        // 1. 初始化藝伎
        const geishas: Geisha[] = [
            { id: 1, name: '櫻', score: 2 },
            { id: 2, name: '梅', score: 2 },
            { id: 3, name: '菊', score: 2 },
            { id: 4, name: '蘭', score: 3 },
            { id: 5, name: '楓', score: 3 },
            { id: 6, name: '牡丹', score: 4 },
            { id: 7, name: '菖蒲', score: 5 }
        ]

        // 2. 初始化卡牌（每位藝伎的卡牌數與分數相同）
        const allCards: Card[] = geishas.flatMap(g =>
            Array(g.score).fill(null).map((_, i) => ({
                geishaId: g.id,
                cardId: `${g.id}-${i}`
            }))
        )

        // 3. 洗牌並移除一張
        const shuffledCards = shuffle(allCards)
        shuffledCards.pop() // 移除一張卡

        // 4. 分發手牌
        const players = room.users.map(user => user.userId)
        const playerStates: Players = {
            [players[0]]: {
                userId: players[0],
                username: room.users[0].username,
                hand: shuffledCards.slice(0, 6),
                actionsUsed: [],
                revealed: [],
                protected: [],
                discarded: []
            },
            [players[1]]: {
                userId: players[1],
                username: room.users[1].username,
                hand: shuffledCards.slice(6, 12),
                actionsUsed: [],
                revealed: [],
                protected: [],
                discarded: []
            }
        }


        // 5. 設定遊戲狀態
        room.gameState = {
            phase: 'playing',
            round: 1,
            geishas,
            table: {},
            players: playerStates,
            currentPlayer: players[0], // 由房主先開始
            availableActions: [1, 2, 3, 4]
        }

        // 6. 通知玩家遊戲開始
        this._io?.to(roomId).emit('gameUpdate', {
            action: { type: 'GAME_START' },
            roomInfo: this.getRoomInfo(roomId)
        })
    }

    // 公開方法
    getIO(): SocketIOServer | null {
        return this._io
    }

    hasIO(): boolean {
        return this._io !== null
    }

    getRooms(): GameRoom[] {
        return Array.from(this.rooms.values())
    }
}

export const socketManager = SocketManager.getInstance()
