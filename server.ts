import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { socketManager } from './src/lib/socket'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    // 1. 創建 HTTP 伺服器
    const server = createServer(async (req, res) => {
        if (!req.url) return

        // 2. 所有 HTTP 請求都交給 Next.js 處理
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
    })

    // 3. 在同一個 HTTP 伺服器上初始化 Socket.IO
    socketManager.initializeIO(server)

    // 4. 啟動伺服器監聽指定 port
    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })
})
