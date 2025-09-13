// src/pages/GameRoom/index.tsx - 增加房間代碼顯示
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import GameBoard from '../../components/game/GameBoard';

/**
 * GameRoom 組件：增加房間代碼顯示和複製功能
 */
const GameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { state } = useGame();
    const { isConnected } = useWebSocket('ws://localhost:3001');
    const [showRoomCode, setShowRoomCode] = useState(false);

    // 調試輸出
    useEffect(() => {
        console.log('🎮 [GameRoom] 狀態更新:');
        console.log('  - roomId:', roomId);
        console.log('  - 玩家數量:', state.players.length);
        console.log('  - 玩家陣列:', state.players);
        console.log('  - 遊戲階段:', state.phase);
        console.log('  - 遊戲 ID:', state.gameId);
        console.log('  - WebSocket 連線:', isConnected);
    }, [state, roomId, isConnected]);

    // 複製房間代碼
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

    const isWaiting = state.phase === 'waiting' || state.players.length < 2;

    if (!isConnected) {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                    <div className="spinner-custom mb-3"></div>
                    <h3>連接伺服器中...</h3>
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
        </div>
    );
};

export default GameRoom;