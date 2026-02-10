// src/components/game/OrderDecisionModal.tsx
import React, { useState, useEffect } from 'react';
import { OrderDecision } from "game-shared-types"

interface OrderDecisionModalProps extends OrderDecision {
    // 玩家按下確認時的回呼
    onConfirm: () => void;
    getPlayerDisplayName?: (playerId: string) => string;
}

const OrderDecisionModal: React.FC<OrderDecisionModalProps> = ({
    isOpen,
    phase,
    players,
    result,
    confirmations,
    waitingFor,
    currentPlayer,
    onConfirm,
    getPlayerDisplayName
}) => {
    const [dots, setDots] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 決定中的動畫效果
    useEffect(() => {
        if (phase === 'deciding') {
            const interval = setInterval(() => {
                setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
            }, 500);
            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (isOpen) {
            setIsCollapsed(false);
        }
    }, [isOpen, phase]);

    if (!isOpen) return null;

    // 決定中畫面
    const renderDecidingPhase = () => (
        <div className="text-center">
            <div className="mb-4">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">載入中...</span>
                </div>
                <h4>🎲 隨機決定先後順序{dots}</h4>
                <p className="text-muted">正在為以下玩家決定順序：</p>
                <div className="d-flex justify-content-center gap-3 mb-3">
                    {players.map((player, index) => (
                        <div key={player} className="card p-3">
                            <div className="text-center">
                                <div className="fs-5 mb-2">👤</div>
                                <strong>{getPlayerDisplayName ? getPlayerDisplayName(player) : player}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // 結果畫面
    const renderResultPhase = () => (
        <div className="text-center">
            <div className="mb-4">
                <h4 className="text-success">🎯 順序決定完成！</h4>

                {/* 顯示結果 */}
                <div className="justify-content-center mt-4 ">
                    <div className="row decide-turn-order">
                        <div className="col-md-6">
                            <div className="card bg-primary text-white mb-3 ">
                                <div className="card-body">
                                    <h5 className="card-title">🥇 先手玩家</h5>
                                    <div className="fs-4">
                                        {result?.firstPlayer
                                            ? (getPlayerDisplayName ? getPlayerDisplayName(result.firstPlayer) : result.firstPlayer)
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card bg-secondary text-white mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">🥈 後手玩家</h5>
                                    <div className="fs-4">
                                        {result?.secondPlayer
                                            ? (getPlayerDisplayName ? getPlayerDisplayName(result.secondPlayer) : result.secondPlayer)
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 確認狀態 */}
                <div className="mt-4">
                    <h6>確認狀態：</h6>
                    <div className="d-flex justify-content-center gap-3">
                        {players.map(player => (
                            <div key={player} className="d-flex align-items-center">
                                <span className={`badge me-2 ${confirmations.includes(player) ? 'bg-success' : 'bg-warning'}`}>
                                    {confirmations.includes(player) ? '✓' : '⏳'}
                                </span>
                                <span className={confirmations.includes(player) ? 'text-success' : 'text-muted'}>
                                    {getPlayerDisplayName ? getPlayerDisplayName(player) : player}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 等待其他玩家確認 */}
                {waitingFor.length > 0 && !waitingFor.includes(currentPlayer) && (
                    <div className="alert alert-info mt-3">
                        <small>
                            等待 {waitingFor.map((player) => (
                                getPlayerDisplayName ? getPlayerDisplayName(player) : player
                            )).join(', ')} 確認...
                        </small>
                    </div>
                )}

                {/* 確認按鈕 */}
                {waitingFor.includes(currentPlayer) && (
                    <button
                        className="btn btn-success btn-lg mt-3"
                        onClick={onConfirm}
                    >
                        確認順序 ✓
                    </button>
                )}

                {/* 已確認狀態 */}
                {confirmations.includes(currentPlayer) && (
                    <div className="alert alert-success mt-3">
                        <strong>✓ 您已確認順序</strong>
                        {waitingFor.length > 0 && (
                            <div><small>等待其他玩家確認...</small></div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bottom-sheet">
            <div className="bottom-sheet__backdrop" />
            <div className={`bottom-sheet__panel ${isCollapsed ? 'is-collapsed' : ''}`}>
                {
                    !isCollapsed && (
                        <div className="bottom-sheet__header">
                            <button
                                className="bottom-sheet__toggle"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                            >
                                {isCollapsed ? '展開' : '收合'}
                            </button>
                        </div>

                    )
                }

                {!isCollapsed && (
                    <div className="bottom-sheet__body">
                        {phase === 'deciding' && renderDecidingPhase()}
                        {(phase === 'result' || phase === 'waiting_confirmation') && renderResultPhase()}
                    </div>
                )}
                {isCollapsed && (
                    <button className="bottom-sheet__expand" onClick={() => setIsCollapsed(false)}>
                        展開操作
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDecisionModal;
