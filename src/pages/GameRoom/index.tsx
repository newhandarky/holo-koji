// src/pages/GameRoom/index.tsx - 添加順序決定彈窗
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import GameBoard from '../../components/game/GameBoard';
import OrderDecisionModal from '../../components/game/OrderDecisionModal';
import config from '../../config/environment';
import { Player, ActionToken } from "game-shared-types"

const createInitialActionTokens = (): ActionToken[] => [
    { type: 'secret', used: false },
    { type: 'trade-off', used: false },
    { type: 'gift', used: false },
    { type: 'competition', used: false },
];

const createPlayerProfile = (id: string): Player => ({
    id,
    name: id,
    hand: [],
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: createInitialActionTokens(),
});

const GameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { state } = useGame();
    const [playerProfile, setPlayerProfile] = useState<Player | null>(null);
    const { isConnected, confirmOrder } = useWebSocket(roomId ?? null, playerProfile);
    const [showRoomCode, setShowRoomCode] = useState(false);
    const [currentPlayerId, setCurrentPlayerId] = useState('');

    // 獲取當前玩家ID（簡化處理，實際應該從更安全的地方獲取）
    useEffect(() => {
        const savedPlayerId = localStorage.getItem('currentPlayerId');
        if (savedPlayerId) {
            setCurrentPlayerId(savedPlayerId);
            setPlayerProfile(prev => prev ?? createPlayerProfile(savedPlayerId));
        }
    }, []);

    useEffect(() => {
        if (!currentPlayerId) return;
        const existingPlayer = state.players.find(player => player.id === currentPlayerId);
        if (existingPlayer) {
            setPlayerProfile(existingPlayer);
        }
    }, [state.players, currentPlayerId]);

    useEffect(() => {
        console.log('🎮 [GameRoom] 狀態更新:');
        console.log('  - roomId:', roomId);
        console.log('  - 玩家數量:', state.players.length);
        console.log('  - 遊戲階段:', state.phase);
        console.log('  - 順序決定狀態:', state.orderDecision);
        console.log('  - 當前玩家ID:', currentPlayerId);
    }, [state, roomId, isConnected, currentPlayerId]);

    const copyRoomCode = async () => {
        if (!roomId) return;

        try {
            await navigator.clipboard.writeText(roomId);
            alert('房間代碼已複製到剪貼簿！');
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = roomId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('房間代碼已複製到剪貼簿！');
        }
    };

    const handleConfirmOrder = () => {
        console.log('🎯 [GameRoom] 玩家確認順序:', currentPlayerId);
        confirmOrder();
    };

    if (!isConnected) {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                    <div className="spinner-custom mb-3"></div>
                    <h3>連接伺服器中...</h3>
                    <small className="text-muted">
                        正在連接到: {config.websocketUrl}
                    </small>
                </div>
            </div>
        );
    }

    if (state.phase === 'ended') {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="card p-4 text-center">
                    <h2 className="text-success mb-3">🎉 遊戲結束！</h2>
                    <p className="fs-5 mb-4">獲勝者: <strong>{state.winner}</strong></p>
                    <button className="btn btn-primary me-2" onClick={() => window.location.href = '/'}>
                        返回大廳
                    </button>
                </div>
            </div>
        );
    }

    const isWaiting = state.phase === 'waiting' || state.players.length < 2;

    if (isWaiting) {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="card p-4 text-center" style={{ minWidth: 450 }}>
                    <div className="spinner-custom mb-3"></div>
                    <h4>等待對手加入</h4>

                    {/* 房間代碼顯示區域 */}
                    <div className="alert alert-primary">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted">房間代碼</small>
                                <div className="fs-4 fw-bold">{roomId}</div>
                            </div>
                            <div>
                                <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => setShowRoomCode(!showRoomCode)}
                                >
                                    {showRoomCode ? '隱藏' : '顯示'}
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={copyRoomCode}>
                                    📋 複製
                                </button>
                            </div>
                        </div>

                        {showRoomCode && (
                            <div className="mt-3 p-3 bg-light rounded">
                                <small className="text-muted">
                                    分享此代碼給朋友加入遊戲：<br />
                                    <code className="fs-6">{roomId}</code>
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="alert alert-info">
                        <strong>目前玩家: {state.players.length}/2</strong>
                        {state.players.length > 0 && (
                            <div className="mt-2">
                                <small>已加入玩家:</small>
                                <ul className="list-unstyled mt-1">
                                    {state.players.map((player, index) => (
                                        <li key={player.id} className="d-flex justify-content-between align-items-center">
                                            <span>
                                                <span className="badge bg-secondary me-2">{index + 1}</span>
                                                {player.name}
                                            </span>
                                            {index === 0 && <span className="badge bg-warning text-dark">房主</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="text-muted small mb-3">
                        {state.players.length === 0 && '初始化中...'}
                        {state.players.length === 1 && '等待第二位玩家加入...'}
                    </div>

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => window.location.href = '/'}
                    >
                        返回大廳
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-background p-3">
            <div className="container-fluid">
                <div className="card game-card p-3">
                    {/* 遊戲資訊欄 */}
                    <div className="row align-items-center mb-4">
                        <div className="col-md-4">
                            <h5 className="mb-0">房間: {roomId}</h5>
                            <button className="btn btn-outline-info btn-sm mt-1" onClick={copyRoomCode}>
                                📋 複製代碼
                            </button>
                        </div>
                        <div className="col-md-4 text-center">
                            <h5 className="mb-0">第 {state.round} 回合</h5>
                            <small className="text-muted">階段: {state.phase}</small>
                        </div>
                        <div className="col-md-4 text-end">
                            <span className="badge bg-primary fs-6">
                                當前玩家: {state.players[state.currentPlayer]?.name || '未知'}
                            </span>
                        </div>
                    </div>

                    {/* 玩家資訊 */}
                    <div className="row mb-3">
                        {state.players.map((player, index) => (
                            <div key={player.id} className="col-md-6 mb-2">
                                <div className={`card ${index === state.currentPlayer ? 'border-primary bg-light' : 'border-secondary'}`}>
                                    <div className="card-body py-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>
                                                <strong>{player.name}</strong>
                                                {index === state.currentPlayer && <span className="badge bg-warning text-dark ms-2">進行中</span>}
                                                {index === 0 && <span className="badge bg-info text-white ms-2">房主</span>}
                                            </span>
                                            <small className="text-muted">
                                                手牌: {player.hand.length}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 遊戲主要區域 */}
                    <GameBoard />

                    {/* 離開遊戲按鈕 */}
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                                if (window.confirm('確定要離開遊戲嗎？')) {
                                    window.location.href = '/';
                                }
                            }}
                        >
                            離開遊戲
                        </button>
                    </div>
                </div>
            </div>

            {/* 順序決定彈窗 */}
            <OrderDecisionModal
                isOpen={state.orderDecision.isOpen}
                phase={state.orderDecision.phase}
                players={state.orderDecision.players}
                result={state.orderDecision.result}
                confirmations={state.orderDecision.confirmations}
                waitingFor={state.orderDecision.waitingFor}
                currentPlayer={currentPlayerId}
                onConfirm={handleConfirmOrder}
            />
        </div>
    );
};

export default GameRoom;
