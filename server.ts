import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer, Socket } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// --- 房間與用戶的暫存資料結構 ---
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

// 簡單的房間管理（正式專案建議用 class 封裝）
const rooms: Record<string, RoomInfo> = {}

app.prepare().then(() => {
    // 1. 創建 HTTP 伺服器
    const server = createServer(async (req, res) => {
        if (!req.url) return

        // 2. 所有 HTTP 請求都交給 Next.js 處理
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
    })

    // 3. 初始化 Socket.IO
    const io = new SocketIOServer(server, {
        cors: { origin: '*' }
    })

    io.on('connection', (socket: Socket) => {
        // 監聽 joinRoom 事件
        socket.on('joinRoom', ({ roomId, userId, username }) => {
            // 初始化房間
            if (!rooms[roomId]) {
                rooms[roomId] = {
                    roomId,
                    userCount: 0,
                    users: [],
                    isReady: false
                }
            }
            // 檢查用戶是否已經在房間
            let user = rooms[roomId].users.find(u => u.userId === userId)
            if (!user) {
                user = { userId, username, joinTime: Date.now() }
                rooms[roomId].users.push(user)
                rooms[roomId].userCount = rooms[roomId].users.length
            }
            // 判斷房間是否已滿（2人）
            rooms[roomId].isReady = rooms[roomId].userCount === 2

            // 分配角色
            const playerRole = rooms[roomId].users[0].userId === userId ? 'player1' : 'player2'

            // 回傳 joinSuccess 給該用戶
            socket.emit('joinSuccess', {
                roomId,
                playerRole,
                roomInfo: rooms[roomId]
            })

            // 廣播 userJoined 給房間內其他人
            socket.to(roomId).emit('userJoined', {
                user,
                roomInfo: rooms[roomId]
            })

            // 讓 socket 加入房間
            socket.join(roomId)
        })

        // 監聽離線
        socket.on('disconnect', () => {
            // 這裡可以補充用戶離線移除邏輯
        })
    })

    // 4. 啟動伺服器監聽指定 port
    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })
})
