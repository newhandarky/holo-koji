// src/pages/GameRoom/index.tsx - 添加順序決定彈窗
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useWebSocket, DealAnimationStep } from '../../hooks/useWebSocket';
import GameBoard from '../../components/game/GameBoard';
import OrderDecisionModal from '../../components/game/OrderDecisionModal';
import PendingInteractionModal from '../../components/game/PendingInteractionModal';
import DrawCardModal from '../../components/game/DrawCardModal';
import config from '../../config/environment';
import { Player, ActionToken } from "game-shared-types"
import { getGeishaNameById } from '../../utils/gameData';

// 建立玩家初始行動指示物
const createInitialActionTokens = (): ActionToken[] => [
    { type: 'secret', used: false },
    { type: 'trade-off', used: false },
    { type: 'gift', used: false },
    { type: 'competition', used: false },
];

// 建立玩家本地資料（尚未同步伺服器時使用）
const createPlayerProfile = (id: string): Player => ({
    id,
    name: id,
    hand: [],
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: createInitialActionTokens(),
    score: {
        charm: 0,
        tokens: 0
    }
});

// 遊戲房間主畫面
const GameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { state } = useGame();
    // 當前玩家 ID（從 localStorage 取得）
    const [currentPlayerId] = useState(() => localStorage.getItem('currentPlayerId') ?? '');
    // 房主 ID（用於陣營顏色）
    const hostId = (state as { hostId?: string }).hostId ?? state.players[0]?.id ?? '';
    // 玩家資料（以伺服器狀態為主）
    const playerProfile = currentPlayerId
        ? (state.players.find(player => player.id === currentPlayerId) ?? createPlayerProfile(currentPlayerId))
        : null;
    const {
        isConnected,
        roundSummary,
        confirmOrder,
        sendGameAction,
        dealQueue,
        consumeDealStep,
        drawQueue,
        consumeDrawEvent
    } = useWebSocket(roomId ?? null, playerProfile);
    // 是否顯示房間代碼
    const [showRoomCode, setShowRoomCode] = useState(false);
    // 發牌動畫目前步驟
    const [activeDealStep, setActiveDealStep] = useState<DealAnimationStep | null>(null);
    // 是否顯示發牌動畫
    const [isDealing, setIsDealing] = useState(false);
    // 抽牌文字提示
    const [recentDraw, setRecentDraw] = useState<string | null>(null);
    // 抽牌視窗顯示卡片
    const [drawModalCard, setDrawModalCard] = useState<null | { playerId: string; card: DealAnimationStep['card'] }>(null);
    // 抽牌視窗開關
    const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

    // 當前狀態除錯紀錄（開發用）
    useEffect(() => {
        console.log('🎮 [GameRoom] 狀態更新:');
        console.log('  - roomId:', roomId);
        console.log('  - 玩家數量:', state.players.length);
        console.log('  - 遊戲階段:', state.phase);
        console.log('  - 順序決定狀態:', state.orderDecision);
        console.log('  - 當前玩家ID:', currentPlayerId);
    }, [state, roomId, isConnected, currentPlayerId]);

    // 發牌動畫節奏控制
    useEffect(() => {
        if (dealQueue.length === 0) {
            setActiveDealStep(null);
            setIsDealing(false);
            return;
        }

        setIsDealing(true);
        setActiveDealStep(dealQueue[0]);

        const timer = window.setTimeout(() => {
            consumeDealStep();
        }, 450);

        return () => window.clearTimeout(timer);
    }, [dealQueue, consumeDealStep]);

    // 抽牌提示顯示與消失
    useEffect(() => {
        if (drawQueue.length === 0) {
            setRecentDraw(null);
            return;
        }

        const { playerId, card } = drawQueue[0];
        if (playerId === currentPlayerId && card.type !== 'hidden') {
            setDrawModalCard({ playerId, card });
            setIsDrawModalOpen(true);
            return;
        }

        const label = `${playerId} 抽到了新卡`;
        setRecentDraw(label);

        const timer = window.setTimeout(() => {
            consumeDrawEvent();
        }, 1200);

        return () => window.clearTimeout(timer);
    }, [drawQueue, currentPlayerId, consumeDrawEvent]);

    // 依目前發牌資訊生成顯示文字
    const dealingLabel = (() => {
        if (!activeDealStep) {
            return '';
        }

        const targetPlayer = state.players.find(player => player.id === activeDealStep.playerId);
        const targetName = targetPlayer?.name ?? activeDealStep.playerId;
        const isMine = activeDealStep.playerId === currentPlayerId;
        const cardInfo = isMine
            ? getGeishaNameById(activeDealStep.card.geishaId)
            : '神秘卡牌';

        return `發牌給 ${targetName}：${cardInfo}`;
    })();

    // 複製房間代碼到剪貼簿
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

    // 玩家確認順序
    const handleConfirmOrder = () => {
        console.log('🎯 [GameRoom] 玩家確認順序:', currentPlayerId);
        confirmOrder();
    };

    // 抽牌視窗確認（只對自己顯示）
    const handleDrawModalConfirm = () => {
        setIsDrawModalOpen(false);
        setDrawModalCard(null);
        consumeDrawEvent();
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
                    <div className="mb-3 text-start">
                        {state.players.map((player) => (
                            <div key={player.id} className="d-flex justify-content-between">
                                <span className="fw-semibold">{player.name}</span>
                                <span>魅力 {player.score?.charm || 0} / 藝妓 {player.score?.tokens || 0}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary me-2" onClick={() => window.location.href = '/'}>
                        返回大廳
                    </button>
                </div>
            </div>
        );
    }

    const isWaiting = state.phase === 'waiting' || state.players.length < 2;

    const pendingInteraction = state.pendingInteraction;
    const needsResponse = pendingInteraction?.targetPlayerId === currentPlayerId;
    const isMyTurn = state.players[state.currentPlayer]?.id === currentPlayerId;
    const canAct =
        state.phase === 'playing'
        && state.players[state.currentPlayer]?.id === currentPlayerId
        && !pendingInteraction;

    if (isWaiting) {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="card p-4 text-center" style={{ minWidth: 450 }}>
                    <div className={`turn-status-banner ${isMyTurn ? 'turn-status-banner--active' : ''}`}>
                        <div>你是：<strong>{currentPlayerId || '未知玩家'}</strong></div>
                        <div>{isMyTurn ? '你的回合' : '等待對手'}</div>
                    </div>
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
                    <div className={`turn-status-banner ${isMyTurn ? 'turn-status-banner--active' : ''}`}>
                        <div>你是：<strong>{currentPlayerId || '未知玩家'}</strong></div>
                        <div>{isMyTurn ? '你的回合' : '等待對手'}</div>
                    </div>
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
                        {state.players.map((player, index) => {
                            const campClass = player.id === hostId ? 'player-card--host' : 'player-card--guest';
                            return (
                            <div key={player.id} className="col-md-6 mb-2">
                                <div className={`card ${campClass} ${index === state.currentPlayer ? 'bg-light' : ''}`}>
                                    <div className="card-body py-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>
                                                <strong>{player.name}</strong>
                                                {index === state.currentPlayer && <span className="badge bg-warning text-dark ms-2">進行中</span>}
                                                {index === 0 && <span className="badge bg-info text-white ms-2">房主</span>}
                                            </span>
                                            <small className="text-muted">
                                                手牌: {player.hand.length}
                                                <br />
                                                魅力: {player.score?.charm || 0} / 藝妓: {player.score?.tokens || 0}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                    </div>

                    {/* 遊戲主要區域 */}
                    <GameBoard
                        state={state}
                        playerId={currentPlayerId}
                        hostId={hostId}
                        onSendAction={sendGameAction}
                        canAct={canAct}
                    />

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

            {isDealing && activeDealStep && (
                <div className="deal-overlay">
                    <div className="deal-card shadow">
                        <div className="spinner-border spinner-border-sm text-light me-2" role="status" />
                        <span>{dealingLabel}</span>
                    </div>
                </div>
            )}

            {recentDraw && (
                <div className="draw-toast shadow">{recentDraw}</div>
            )}

            {roundSummary && (
                <div className="round-summary-overlay">
                    <div className="round-summary-card shadow">
                        <h4 className="mb-2">第 {roundSummary.round} 回合結算完成</h4>
                        <p className="text-muted mb-3">好感指示物已更新，準備進入下一回合</p>
                        <div className="d-flex flex-column gap-2">
                            {state.players.map((player) => (
                                <div key={player.id} className="round-summary-row">
                                    <span className="fw-semibold">{player.name}</span>
                                    <span>魅力 {player.score?.charm || 0}</span>
                                    <span>藝妓 {player.score?.tokens || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <DrawCardModal
                isOpen={isDrawModalOpen}
                card={drawModalCard?.card ?? null}
                onConfirm={handleDrawModalConfirm}
            />

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

            {needsResponse && pendingInteraction && (
                <PendingInteractionModal
                    interaction={pendingInteraction}
                    playerId={currentPlayerId}
                    onResolve={sendGameAction}
                />
            )}
        </div>
    );
};

export default GameRoom;
