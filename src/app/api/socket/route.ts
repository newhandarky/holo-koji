import { NextRequest, NextResponse } from 'next/server'
import { socketManager } from '@/lib/socket'

export async function GET(req: NextRequest) {
  console.log(req, "route.ts");

  console.log('Socket API 被呼叫')

  if (!socketManager.hasIO()) {
    return NextResponse.json({
      error: 'Socket.IO 伺服器尚未初始化',
      message: '請確保使用自定義伺服器啟動應用程式'
    }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Socket.IO 伺服器正在運行',
    connected: true
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const io = socketManager.getIO()

    if (!io) {
      return NextResponse.json({
        error: 'Socket.IO 伺服器未初始化'
      }, { status: 500 })
    }

    // 廣播訊息給所有連接的客戶端
    io.emit('message', body)

    return NextResponse.json({
      message: '訊息已發送',
      data: body
    })
  } catch (error) {
    console.log('處理請求時發生錯誤:', error);

    return NextResponse.json({
      error: '處理請求時發生錯誤'
    }, { status: 500 })
  }
}
