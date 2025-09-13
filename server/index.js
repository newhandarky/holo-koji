// server/index.js - 添加隨機順序決定功能
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
const server = createServer(app);

// CORS 設定
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://holo-koji-frontend.onrender.com',
        'https://newhandarky.github.io',
        'https://newhandarky.github.io/holo-koji',
        'https://newhandarky.github.io/holo-koji/'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        corsOrigins: [
            'http://localhost:3000',
            'https://holo-koji-frontend.onrender.com',
            'https://newhandarky.github.io',
            'https://newhandarky.github.io/holo-koji',
            'https://newhandarky.github.io/holo-koji/'
        ]
    });
});

const gameRooms = new Map();
const wss = new WebSocketServer({ server });

class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = [];
        this.gameState = null;
        this.maxPlayers = 2;
        this.orderDecisionState = {
            isDeciding: false,
            result: null,
            confirmations: new Set()
        };
    }

    addPlayer(playerId, ws) {
        if (this.players.length < this.maxPlayers) {
            this.players.push({ playerId, ws });
            console.log(`✅ 玩家 ${playerId} 加入房間 ${this.roomId}，當前玩家數：${this.players.length}`);
            return true;
        }
        return false;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.playerId !== playerId);
        console.log(`❌ 玩家 ${playerId} 離開房間 ${this.roomId}，當前玩家數：${this.players.length}`);
    }

    broadcast(message, excludePlayerId = null) {
        console.log(`📢 房間 ${this.roomId} 廣播訊息給 ${this.players.length} 個玩家:`, message.type);

        let successCount = 0;
        this.players.forEach((player, index) => {
            if (player.playerId !== excludePlayerId) {
                if (player.ws.readyState === 1) {
                    try {
                        player.ws.send(JSON.stringify(message));
                        console.log(`  ✅ 成功發送給玩家 ${player.playerId} (${index + 1}/${this.players.length})`);
                        successCount++;
                    } catch (error) {
                        console.error(`  ❌ 發送失敗給玩家 ${player.playerId}:`, error);
                    }
                } else {
                    console.warn(`  ⚠️ 玩家 ${player.playerId} 連線狀態異常: ${player.ws.readyState}`);
                }
            }
        });

        console.log(`📢 廣播完成，成功發送給 ${successCount} 個玩家`);
    }

    isFull() {
        return this.players.length === this.maxPlayers;
    }

    // 開始隨機決定順序
    startOrderDecision() {
        console.log(`🎲 房間 ${this.roomId} 開始隨機決定玩家順序`);

        this.orderDecisionState.isDeciding = true;
        this.orderDecisionState.confirmations.clear();

        // 廣播開始決定順序
        this.broadcast({
            type: 'ORDER_DECISION_START',
            payload: {
                players: this.players.map(p => p.playerId)
            }
        });

        // 延遲 2 秒後顯示結果（模擬隨機過程）
        setTimeout(() => {
            this.decideOrder();
        }, 2000);
    }

    // 決定順序並廣播結果
    decideOrder() {
        const playerIds = this.players.map(p => p.playerId);

        // 隨機決定誰先手
        const firstPlayerIndex = Math.random() < 0.5 ? 0 : 1;
        const firstPlayer = playerIds[firstPlayerIndex];
        const secondPlayer = playerIds[1 - firstPlayerIndex];

        this.orderDecisionState.result = {
            firstPlayer,
            secondPlayer,
            order: [firstPlayer, secondPlayer]
        };

        console.log(`🎲 房間 ${this.roomId} 順序決定結果:`, this.orderDecisionState.result);

        // 廣播結果
        this.broadcast({
            type: 'ORDER_DECISION_RESULT',
            payload: this.orderDecisionState.result
        });
    }

    // 處理玩家確認
    confirmOrder(playerId) {
        if (!this.orderDecisionState.result) {
            console.warn(`⚠️ 玩家 ${playerId} 嘗試確認，但順序尚未決定`);
            return;
        }

        this.orderDecisionState.confirmations.add(playerId);
        console.log(`✅ 玩家 ${playerId} 已確認順序，目前確認數: ${this.orderDecisionState.confirmations.size}/2`);

        // 廣播確認狀態
        this.broadcast({
            type: 'ORDER_CONFIRMATION_UPDATE',
            payload: {
                confirmations: Array.from(this.orderDecisionState.confirmations),
                waitingFor: this.players
                    .map(p => p.playerId)
                    .filter(id => !this.orderDecisionState.confirmations.has(id))
            }
        });

        // 如果所有玩家都確認了，開始遊戲
        if (this.orderDecisionState.confirmations.size === 2) {
            setTimeout(() => {
                this.startGameWithOrder();
            }, 1000);
        }
    }

    // 根據決定的順序開始遊戲
    startGameWithOrder() {
        const { order } = this.orderDecisionState.result;
        const gameState = createGameStateWithOrder(this.roomId, order);
        this.gameState = gameState;

        console.log(`🚀 遊戲開始，房間 ${this.roomId}，順序：`, order);

        this.broadcast({
            type: 'GAME_STARTED',
            payload: gameState
        });

        // 重置順序決定狀態
        this.orderDecisionState = {
            isDeciding: false,
            result: null,
            confirmations: new Set()
        };
    }
}

wss.on('connection', (ws, req) => {
    const origin = req.headers.origin;
    console.log('🔌 客戶端已連接，來源:', origin);

    let currentPlayerId = null;
    let currentRoomId = null;

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📨 收到訊息:', message, '來源:', origin);

            switch (message.type) {
                case 'JOIN_ROOM':
                    handleJoinRoom(ws, message.payload);
                    break;
                case 'CREATE_ROOM':
                    handleCreateRoom(ws, message.payload);
                    break;
                case 'CONFIRM_ORDER':
                    handleConfirmOrder(ws, message.payload);
                    break;
                case 'GAME_ACTION':
                    handleGameAction(ws, message.payload);
                    break;
                case 'LEAVE_ROOM':
                    handleLeaveRoom(ws);
                    break;
                default:
                    console.warn('⚠️ 未知訊息類型:', message.type);
            }
        } catch (error) {
            console.error('❌ 訊息解析錯誤:', error);
        }
    });

    ws.on('close', () => {
        if (currentRoomId && currentPlayerId) {
            handleLeaveRoom(ws);
        }
        console.log('🔌 客戶端已斷線，來源:', origin);
    });

    function handleCreateRoom(ws, payload) {
        const roomId = generateRoomId();
        const room = new GameRoom(roomId);
        gameRooms.set(roomId, room);

        currentPlayerId = payload.playerId;
        currentRoomId = roomId;

        room.addPlayer(currentPlayerId, ws);

        console.log(`🏠 房間 ${roomId} 已建立，創建者：${currentPlayerId}，來源：${origin}`);

        ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            payload: { roomId, playerId: currentPlayerId }
        }));

        const initialGameState = createWaitingGameState(roomId, [currentPlayerId]);
        room.gameState = initialGameState;

        room.broadcast({
            type: 'GAME_STATE_UPDATED',
            payload: initialGameState
        });
    }

    function handleJoinRoom(ws, payload) {
        const { roomId, playerId } = payload;
        const room = gameRooms.get(roomId);

        if (!room) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: '房間不存在' }
            }));
            return;
        }

        if (room.isFull()) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: '房間已滿' }
            }));
            return;
        }

        currentPlayerId = playerId;
        currentRoomId = roomId;

        room.addPlayer(playerId, ws);

        console.log(`👤 玩家 ${playerId} 加入房間 ${roomId}，來源：${origin}`);

        ws.send(JSON.stringify({
            type: 'PLAYER_JOINED',
            payload: { playerId, roomId }
        }));

        const updatedGameState = createWaitingGameState(roomId, room.players.map(p => p.playerId));
        room.gameState = updatedGameState;

        room.broadcast({
            type: 'GAME_STATE_UPDATED',
            payload: updatedGameState
        });

        // 如果房間滿了，開始隨機決定順序
        if (room.isFull()) {
            console.log(`🎮 房間 ${roomId} 已滿，開始隨機決定順序`);
            setTimeout(() => {
                room.startOrderDecision();
            }, 1000);
        }
    }

    function handleConfirmOrder(ws, payload) {
        const room = gameRooms.get(currentRoomId);
        if (room && currentPlayerId) {
            room.confirmOrder(currentPlayerId);
        }
    }

    function handleGameAction(ws, payload) {
        const room = gameRooms.get(currentRoomId);
        if (room) {
            room.broadcast({
                type: 'GAME_ACTION',
                payload: { ...payload, playerId: currentPlayerId }
            }, currentPlayerId);
        }
    }

    function handleLeaveRoom(ws) {
        if (currentRoomId && currentPlayerId) {
            const room = gameRooms.get(currentRoomId);
            if (room) {
                room.removePlayer(currentPlayerId);
                room.broadcast({
                    type: 'PLAYER_LEFT',
                    payload: { playerId: currentPlayerId }
                });

                if (room.players.length === 0) {
                    gameRooms.delete(currentRoomId);
                    console.log(`🗑️ 房間 ${currentRoomId} 已刪除`);
                }
            }
        }
    }
});

function createWaitingGameState(gameId, playerIds) {
    return {
        gameId,
        players: playerIds.map(id => createPlayer(id)),
        geishas: createInitialGeishas(),
        currentPlayer: 0,
        phase: 'waiting',
        round: 1,
        winner: null
    };
}

function createGameStateWithOrder(gameId, orderedPlayerIds) {
    const players = orderedPlayerIds.map(id => createPlayerWithCards(id));

    return {
        gameId,
        players,
        geishas: createInitialGeishas(),
        currentPlayer: 0, // 第一個玩家開始
        phase: 'playing',
        round: 1,
        winner: null
    };
}

function createPlayer(playerId) {
    return {
        id: playerId,
        name: playerId,
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [
            { type: 'secret', used: false },
            { type: 'trade-off', used: false },
            { type: 'gift', used: false },
            { type: 'competition', used: false }
        ]
    };
}

function createPlayerWithCards(playerId) {
    return {
        id: playerId,
        name: playerId,
        hand: generateInitialHand(),
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [
            { type: 'secret', used: false },
            { type: 'trade-off', used: false },
            { type: 'gift', used: false },
            { type: 'competition', used: false }
        ]
    };
}

function generateInitialHand() {
    const cards = [];
    for (let i = 0; i < 6; i++) {
        cards.push({
            id: `card-${Math.random().toString(36).substring(2)}`,
            geishaId: Math.floor(Math.random() * 7) + 1,
            type: '物品'
        });
    }
    return cards;
}

function createInitialGeishas() {
    return [
        { id: 1, name: '洋子', charmPoints: 2, controlledBy: null },
        { id: 2, name: '彩葉', charmPoints: 2, controlledBy: null },
        { id: 3, name: '琉璃', charmPoints: 2, controlledBy: null },
        { id: 4, name: '杏樹', charmPoints: 3, controlledBy: null },
        { id: 5, name: '知世', charmPoints: 3, controlledBy: null },
        { id: 6, name: '美櫻', charmPoints: 4, controlledBy: null },
        { id: 7, name: '小雪', charmPoints: 5, controlledBy: null },
    ];
}

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 伺服器運行在 port ${PORT}`);
    console.log(`🌍 環境: ${process.env.NODE_ENV}`);
    console.log(`⚡ WebSocket 伺服器已啟動`);
    console.log(`📊 CORS 允許的域名:`, [
        'http://localhost:3000',
        'https://holo-koji-frontend.onrender.com',
        'https://newhandarky.github.io',
        'https://newhandarky.github.io/holo-koji',
        'https://newhandarky.github.io/holo-koji/'
    ]);
});