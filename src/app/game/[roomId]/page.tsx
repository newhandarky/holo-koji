'use client'

import { useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useGameSocket } from '@/hooks/useSocket'

export default function GamePage() {
    const params = useParams()
    const roomId = typeof params.roomId === 'string' ? params.roomId : Array.isArray(params.roomId) ? params.roomId[0] : ''
    const searchParams = useSearchParams()
    const username = searchParams.get('username')
    const userId = searchParams.get('userId') || '' // 若有 userId
    const { roomInfo, joinRoom, playerRole } = useGameSocket(roomId)
    console.log("playerRole", playerRole);
    console.log("roomInfo", roomInfo);

    // 找出對手名字
    const opponent = roomInfo?.users.find(u => u.username !== username)



    useEffect(() => {
        if (roomId && username) {
            joinRoom(roomId, userId, username)
        }
    }, [roomId, userId, username, joinRoom])


    // 你可以根據 roomInfo 渲染遊戲畫面
    return (
        <div className="max-w-2xl mx-auto p-3 h-screen w-screen">
            {/* 這裡放遊戲主畫面 */}
            <h1 className="text-2xl font-bold mb-4">testPage</h1>
            <p>{roomId}</p>
            <div className='flex flex-col items-center justify-between h-[calc(100vh-84px)]'>

                {/* <p>房間ID：{roomId}</p> */}
                {/* <p>你的對手：{opponent?.username}</p> */}
                <p>{opponent?.username}</p>

                <div className='flex flex-nowrap justify-end overflow-auto'>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>
                    <div className="w-[100px]">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                    </div>

                </div>
                {/* <p>你的角色：{username}</p> */}
                <p>{username}</p>
            </div>
        </div>
    )
}
