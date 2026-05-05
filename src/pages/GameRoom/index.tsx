// src/pages/GameRoom/index.tsx - 添加順序決定彈窗
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import GameBoard from '../../components/game/GameBoard';
import type { FocusSection } from '../../components/game/GameBoard';
import OrderDecisionModal from '../../components/game/OrderDecisionModal';
import PendingInteractionModal from '../../components/game/PendingInteractionModal';
import {
    buildMotionSnapshot,
    createDrawMotionCue,
    deriveMotionCues,
    MotionCue,
    usePrefersReducedMotion
} from '../../components/game/gameMotion';
import config from '../../config/environment';
import { frontendLogger, summarizeGameState } from '../../utils/runtimeLogger';
import { Player, ActionToken, ItemCard, GeishaSet } from "game-shared-types"
import { shareRoomInvite, getLiffInviteUrl, isLineClient } from '../../utils/lineLiff';
import { getGeishaCharmById, getItemCardImage } from '../../utils/gameData';
import { actionStatusConfig } from '../../utils/actionAssets';

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

const SECTION_TABS: Array<{ section: FocusSection; label: string }> = [
    { section: 'info', label: '資訊' },
    { section: 'characterBoard', label: '角色' },
    { section: 'handActions', label: '手牌&指令' }
];

type ReplayActionType = 'secret' | 'trade-off' | null;

// 遊戲房間主畫面
const GameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { state } = useGame();
    // 當前玩家 ID（從 localStorage 取得）
    const [currentPlayerId] = useState(() => localStorage.getItem('currentPlayerId') ?? '');
    const [localLineName] = useState(() => localStorage.getItem('lineDisplayName') ?? '');
    const [localLineAvatar] = useState(() => localStorage.getItem('lineAvatarUrl') ?? '');
    // 房主 ID（用於陣營顏色）
    const hostId = (state as { hostId?: string }).hostId ?? state.players[0]?.id ?? '';
    // 玩家資料（以伺服器狀態為主）
    const currentPlayer = currentPlayerId
        ? (state.players.find(player => player.id === currentPlayerId) ?? null)
        : null;
    const playerProfile = currentPlayerId
        ? (currentPlayer ?? createPlayerProfile(currentPlayerId))
        : null;
    const playersById = useMemo(() => new Map(state.players.map((player) => [player.id, player])), [state.players]);
    const getPlayerDisplayName = (playerId?: string) => {
        if (!playerId) return '未知玩家';
        const player = playersById.get(playerId);
        return player?.name
            || (playerId === currentPlayerId ? localLineName : '')
            || playerId
            || '未知玩家';
    };
    const getPlayerAvatar = (playerId?: string) => {
        if (!playerId) return '';
        const player = playersById.get(playerId);
        return player?.avatarUrl || (playerId === currentPlayerId ? localLineAvatar : '') || '';
    };
    const displayName = getPlayerDisplayName(currentPlayerId);
    const displayAvatar = getPlayerAvatar(currentPlayerId);
    const {
        isConnected,
        error,
        roundSummary,
        readyStatus,
        confirmOrder,
        sendGameAction,
        requestRematch,
        confirmReady,
        leaveRoom,
        drawQueue,
        consumeDrawEvent
    } = useWebSocket(roomId ?? null, playerProfile);
    const activeGeishaSet: GeishaSet = state.geishaSet ?? 'default';
    // 是否顯示房間代碼
    const [showRoomCode, setShowRoomCode] = useState(false);
    // 抽牌文字提示
    const [recentDraw, setRecentDraw] = useState<string | null>(null);
    // 抽牌視窗開關
    const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
    // 抽牌動畫目標卡片
    const [drawHighlightCardId, setDrawHighlightCardId] = useState<string | null>(null);
    // 抽牌動畫是否顯示
    const [isDrawHighlightActive, setIsDrawHighlightActive] = useState(false);
    // 再來一場送出狀態
    const [isRematchRequested, setIsRematchRequested] = useState(false);
    // 結算底部視窗是否收合
    const [isEndSheetCollapsed, setIsEndSheetCollapsed] = useState(false);
    const [activeMotionCues, setActiveMotionCues] = useState<MotionCue[]>([]);
    const [focusSection, setFocusSection] = useState<FocusSection>('characterBoard');
    const [expandedInfoReplayAction, setExpandedInfoReplayAction] = useState<ReplayActionType>(null);
    const previousFocusSectionRef = useRef<FocusSection>('characterBoard');
    const wasInteractionLockedRef = useRef(false);
    const canActBeforeBlockingRef = useRef(false);
    const previousCanActRef = useRef(false);
    const previousMotionSnapshotRef = useRef<ReturnType<typeof buildMotionSnapshot> | null>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const enqueueMotionCues = useCallback((cues: MotionCue[]) => {
        if (cues.length === 0) {
            return;
        }

        setActiveMotionCues((previous) => {
            const next = [...previous, ...cues];
            const seen = new Set<string>();

            return next.filter((cue) => {
                if (seen.has(cue.id)) {
                    return false;
                }

                seen.add(cue.id);
                return true;
            });
        });

        cues.forEach((cue) => {
            window.setTimeout(() => {
                setActiveMotionCues((previous) => previous.filter((currentCue) => currentCue.id !== cue.id));
            }, cue.durationMs + cue.delayMs + 160);
        });
    }, []);

    useEffect(() => {
        frontendLogger.diagnostic('🐞 [GameRoom] 狀態摘要', {
            roomId,
            currentPlayerId,
            ...summarizeGameState(state)
        });
    }, [state, roomId, isConnected, currentPlayerId]);

    // 進入新局時重置再來一場狀態
    useEffect(() => {
        if (state.phase !== 'ended' && isRematchRequested) {
            setIsRematchRequested(false);
        }
    }, [state.phase, isRematchRequested]);

    // 新對局時還原結算視窗狀態
    useEffect(() => {
        if (state.phase !== 'ended') {
            setIsEndSheetCollapsed(false);
        }
    }, [state.phase]);

    // 抽牌提示顯示與消失
    useEffect(() => {
        if (drawQueue.length === 0) {
            setRecentDraw(null);
            return;
        }

        const { playerId, card } = drawQueue[0];
        if (playerId === currentPlayerId && card.type !== 'hidden') {
            setIsDrawModalOpen(true);
            setDrawHighlightCardId(card.id);
            setIsDrawHighlightActive(false);

            const revealTimer = window.setTimeout(() => {
                setIsDrawHighlightActive(true);
                enqueueMotionCues([createDrawMotionCue(card.id, prefersReducedMotion)]);
            }, 1000);

            const highlightTimer = window.setTimeout(() => {
                setIsDrawHighlightActive(false);
            }, 1500);

            const closeTimer = window.setTimeout(() => {
                setIsDrawModalOpen(false);
                setIsDrawHighlightActive(false);
                setDrawHighlightCardId(null);
                consumeDrawEvent();
            }, 5000);

            return () => {
                window.clearTimeout(revealTimer);
                window.clearTimeout(highlightTimer);
                window.clearTimeout(closeTimer);
            };
        }

        const label = `${playerId} 抽到了新卡`;
        setRecentDraw(label);

        const timer = window.setTimeout(() => {
            consumeDrawEvent();
        }, 1200);

        return () => window.clearTimeout(timer);
    }, [drawQueue, currentPlayerId, consumeDrawEvent, enqueueMotionCues, prefersReducedMotion]);

    useEffect(() => {
        if (!currentPlayerId || state.phase !== 'playing') {
            previousMotionSnapshotRef.current = buildMotionSnapshot(state, currentPlayerId);
            return;
        }

        const currentSnapshot = buildMotionSnapshot(state, currentPlayerId);
        const previousSnapshot = previousMotionSnapshotRef.current;

        if (previousSnapshot) {
            enqueueMotionCues(deriveMotionCues(previousSnapshot, currentSnapshot, prefersReducedMotion));
        }

        previousMotionSnapshotRef.current = currentSnapshot;
    }, [currentPlayerId, enqueueMotionCues, prefersReducedMotion, state]);

    const activePendingMotionKind = useMemo<'gift-result' | 'competition-result' | null>(() => {
        const cue = activeMotionCues.find((item) => item.kind === 'gift-result' || item.kind === 'competition-result');
        if (cue?.kind === 'gift-result' || cue?.kind === 'competition-result') {
            return cue.kind;
        }

        return null;
    }, [activeMotionCues]);



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
        confirmOrder();
    };

    const handleReturnToLobby = useCallback(() => {
        leaveRoom();
        navigate('/');
    }, [leaveRoom, navigate]);

    const isGameEnded = state.phase === 'ended';

    const isWaiting = state.phase === 'waiting' || state.players.length < 2;

    const pendingInteraction = state.pendingInteraction;
    const needsResponse = pendingInteraction?.targetPlayerId === currentPlayerId;
    const isMyTurn = state.players[state.currentPlayer]?.id === currentPlayerId;
    const isInteractionLocked = Boolean(pendingInteraction)
        || isDrawModalOpen
        || state.orderDecision.isOpen
        || Boolean(readyStatus)
        || isGameEnded;
    const canAct =
        state.phase === 'playing'
        && state.players[state.currentPlayer]?.id === currentPlayerId
        && !pendingInteraction
        && !isDrawModalOpen
        && !state.orderDecision.isOpen;
    const activeTurnPlayerName = getPlayerDisplayName(state.players[state.currentPlayer]?.id);
    const localActionTokenMap = useMemo(
        () => new Map((currentPlayer?.actionTokens ?? []).map((token) => [token.type, token])),
        [currentPlayer?.actionTokens]
    );
    const localReplayCardsByAction = useMemo<Record<'secret' | 'trade-off', ItemCard[]>>(() => ({
        secret: currentPlayer?.secretCards ?? [],
        'trade-off': currentPlayer?.discardedCards ?? []
    }), [currentPlayer?.discardedCards, currentPlayer?.secretCards]);

    const isReplayEligible = useCallback((playerId: string, actionType: ActionToken['type']) => {
        if (playerId !== currentPlayerId || (actionType !== 'secret' && actionType !== 'trade-off')) {
            return false;
        }
        const token = localActionTokenMap.get(actionType);
        return Boolean(token?.used && localReplayCardsByAction[actionType].length > 0);
    }, [currentPlayerId, localActionTokenMap, localReplayCardsByAction]);

    const handleInfoActionIconClick = useCallback((playerId: string, actionType: ActionToken['type']) => {
        if (!isReplayEligible(playerId, actionType)) {
            return;
        }
        if (actionType === 'secret' || actionType === 'trade-off') {
            setExpandedInfoReplayAction(actionType);
        }
    }, [isReplayEligible]);
    useEffect(() => {
        if (state.phase !== 'playing') {
            setFocusSection('characterBoard');
            previousFocusSectionRef.current = 'characterBoard';
        }
    }, [state.phase]);

    useEffect(() => {
        const wasLocked = wasInteractionLockedRef.current;
        if (!wasLocked && isInteractionLocked) {
            previousFocusSectionRef.current = focusSection;
            canActBeforeBlockingRef.current = canAct;
        }
        if (wasLocked && !isInteractionLocked) {
            const becameActionable = !canActBeforeBlockingRef.current && canAct;
            setFocusSection(becameActionable ? 'handActions' : previousFocusSectionRef.current);
        }
        wasInteractionLockedRef.current = isInteractionLocked;
    }, [canAct, focusSection, isInteractionLocked]);

    useEffect(() => {
        const wasCanAct = previousCanActRef.current;
        if (!wasCanAct && canAct && !isInteractionLocked) {
            setFocusSection('handActions');
        }
        previousCanActRef.current = canAct;
    }, [canAct, isInteractionLocked]);

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

    if (error) {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="card p-4 text-center" style={{ minWidth: 360, maxWidth: 520 }}>
                    <h4 className="text-danger mb-3">無法進入對戰</h4>
                    <p className="mb-4">{error}</p>
                    <button className="btn btn-primary" onClick={handleReturnToLobby}>返回大廳</button>
                </div>
            </div>
        );
    }

    if (isWaiting) {
        return (
            <div className="game-background d-flex align-items-center justify-content-center">
                <div className="card p-4 text-center" style={{ minWidth: 450 }}>
                    <div className={`turn-status-banner ${isMyTurn ? 'turn-status-banner--active' : ''}`}>
                        <div className="d-flex align-items-center gap-2">
                            {displayAvatar && (
                                <img
                                    className="player-avatar"
                                    src={displayAvatar}
                                    alt={`${displayName} 頭像`}
                                />
                            )}
                            <p className='mb-0'>你是：
                                <strong>{displayName}</strong>
                            </p>
                        </div>
                        <div>{isMyTurn ? '你的回合' : '等待對手'}</div>
                    </div>
                    <div className="spinner-custom mb-3"></div>
                    <h4>等待對手加入</h4>

                    {/* 房間代碼顯示區域 */}
                    <div className="alert alert-primary">
                        <div className="waiting-room-actions-group mb-2">
                            <div className="waiting-room-actions">
                                <button
                                    className="btn btn-outline-primary btn-sm waiting-room-button"
                                    onClick={() => setShowRoomCode(!showRoomCode)}
                                >
                                    {showRoomCode ? '隱藏' : '顯示'}
                                </button>
                                <button className="btn btn-primary btn-sm waiting-room-button" onClick={copyRoomCode}>
                                    複製
                                </button>
                            </div>
                            <div className={`waiting-room-actions ${!isLineClient() && roomId ? '' : 'waiting-room-actions--single'}`}>
                                <button
                                    className="btn btn-success btn-sm waiting-room-button"
                                    onClick={async () => {
                                        if (!roomId) return;
                                        try {
                                            const result = await shareRoomInvite(roomId);
                                            if (result.mode === 'copy') {
                                                alert('已複製邀請連結，請貼給好友！');
                                            }
                                        } catch (error) {
                                            frontendLogger.error('❌ LINE 邀請失敗', {
                                                error: error instanceof Error ? error.message : 'unknown'
                                            });
                                            const message = error instanceof Error ? error.message : 'LINE 邀請失敗，請改用複製連結分享。';
                                            alert(message);
                                        }
                                    }}
                                >
                                    LINE 邀請好友
                                </button>
                                {!isLineClient() && roomId && (
                                    <button
                                        className="btn btn-outline-success btn-sm waiting-room-button"
                                        onClick={() => {
                                            window.location.href = getLiffInviteUrl(roomId);
                                        }}
                                    >
                                        用 LINE 開啟
                                    </button>
                                )}
                            </div>
                        </div>

                        {!isLineClient() && (
                            <div className="mt-2 text-muted">
                                <small>提示：請在 LINE App 內開啟，才能使用選擇好友功能。</small>
                            </div>
                        )}

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
                                                {getPlayerDisplayName(player.id)}
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
                        onClick={handleReturnToLobby}
                    >
                        返回大廳
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-background game-room-page p-3">
            <div className="container-fluid">
                <div className={`card game-card game-room-surface p-2 ${isInteractionLocked ? 'game-card--locked' : ''} game-room-focus-layout`}>
                    <nav className="game-room-tabs" aria-label="遊戲區塊切換">
                        {SECTION_TABS.map((tab) => {
                            const isActive = focusSection === tab.section;
                            return (
                                <button
                                    key={tab.section}
                                    type="button"
                                    className={`game-room-tabs__button ${isActive ? 'is-active' : ''}`}
                                    onClick={() => setFocusSection(tab.section)}
                                    aria-pressed={isActive}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                    <section className={`game-focus-section game-focus-section--info ${focusSection === 'info' ? 'is-expanded' : 'is-collapsed'}`}>
                        {focusSection === 'info' && (
                            <div className="game-focus-content game-info-panel">
                                <div className="game-info-status-row mb-3">
                                    <div className="game-info-status-row__current">
                                        {activeTurnPlayerName === displayName ? '你的回合' : '對手的回合'}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm game-info-status-row__leave"
                                        onClick={() => {
                                            if (window.confirm('確定要離開遊戲嗎？')) {
                                                handleReturnToLobby();
                                            }
                                        }}
                                    >
                                        離開遊戲
                                    </button>
                                </div>
                                <div className="row mb-3 gy-3">
                                    {state.players.map((player, index) => {
                                        const campClass = player.id === hostId ? 'player-card--host' : 'player-card--guest';
                                        const actionUsedMap = new Map(player.actionTokens.map((token) => [token.type, token.used]));
                                        const isLocalPlayerRow = player.id === currentPlayerId;
                                        const activeReplayCards = expandedInfoReplayAction ? localReplayCardsByAction[expandedInfoReplayAction] : [];

                                        return (
                                            <div key={player.id} className="col-md-6 mb-2">
                                                <div className={`card player-card ${campClass} ${index === state.currentPlayer ? 'bg-light' : ''}`}>
                                                    <div className="card-body py-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="d-inline-flex align-items-center gap-2">
                                                                {getPlayerAvatar(player.id) && (
                                                                    <img
                                                                        className="player-avatar"
                                                                        src={getPlayerAvatar(player.id)}
                                                                        alt={`${getPlayerDisplayName(player.id)} 頭像`}
                                                                    />
                                                                )}
                                                                <strong>{getPlayerDisplayName(player.id)}</strong>
                                                                {index === state.currentPlayer && <span className="badge bg-warning text-dark ms-2">進行中</span>}
                                                                {index === 0 && <span className="badge bg-info text-white ms-2">房主</span>}
                                                            </span>
                                                            <small className="text-muted">
                                                                手牌: {player.hand.length}
                                                                <br />
                                                                魅力: {player.score?.charm || 0} / 藝妓: {player.score?.tokens || 0}
                                                            </small>
                                                        </div>
                                                        <div className="game-info-action-row mt-2">
                                                            {actionStatusConfig.map((actionItem) => {
                                                                const used = actionUsedMap.get(actionItem.type) ?? false;
                                                                const replayEligible = isReplayEligible(player.id, actionItem.type);
                                                                const isReplayActive = replayEligible && expandedInfoReplayAction === actionItem.type;
                                                                const classNames = [
                                                                    'game-info-action',
                                                                    used ? 'is-used' : 'is-available',
                                                                    replayEligible ? 'is-replayable' : 'is-status-only',
                                                                    isReplayActive ? 'is-replay-active' : ''
                                                                ].filter(Boolean).join(' ');

                                                                return (
                                                                    <button
                                                                        key={`${player.id}-${actionItem.type}`}
                                                                        type="button"
                                                                        className={classNames}
                                                                        onClick={() => handleInfoActionIconClick(player.id, actionItem.type)}
                                                                        disabled={!replayEligible}
                                                                        aria-label={`${actionItem.label}${used ? '（已使用）' : '（未使用）'}`}
                                                                    >
                                                                        <img className="game-info-action__icon" src={actionItem.iconUrl} alt={actionItem.label} />
                                                                        <span className="game-info-action__label">{actionItem.label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {isLocalPlayerRow && expandedInfoReplayAction && activeReplayCards.length > 0 && (
                                                            <div className="game-info-replay mt-2">
                                                                <div className="game-info-replay__title">
                                                                    {expandedInfoReplayAction === 'secret' ? '密約回看' : '取捨回看'}
                                                                </div>
                                                                <div className="game-info-replay__cards">
                                                                    {activeReplayCards.map((card) => (
                                                                        <div
                                                                            key={card.id}
                                                                            className="item-card item-card--image item-card--mini"
                                                                            style={{ backgroundImage: `url(${getItemCardImage(card, activeGeishaSet)})` }}
                                                                        >
                                                                            <div className="item-card__overlay" />
                                                                            <div className="item-card__badge">魅力 {getGeishaCharmById(card.geishaId)}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    <GameBoard
                        state={state}
                        playerId={currentPlayerId}
                        hostId={hostId}
                        onSendAction={sendGameAction}
                        canAct={canAct}
                        highlightCardId={drawHighlightCardId}
                        highlightActive={isDrawHighlightActive}
                        motionCues={activeMotionCues}
                        prefersReducedMotion={prefersReducedMotion}
                        focusSection={focusSection}
                    />
                </div>
            </div>

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
                                    <span className="fw-semibold">{getPlayerDisplayName(player.id)}</span>
                                    <span>魅力 {player.score?.charm || 0}</span>
                                    <span>藝妓 {player.score?.tokens || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isDrawModalOpen && (
                <div className="top-sheet">
                    <div className="top-sheet__panel">
                        <div className="top-sheet__title">你抽到一張新牌</div>
                    </div>
                </div>
            )}

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
                getPlayerDisplayName={getPlayerDisplayName}
            />

            {readyStatus && (
                <div className="bottom-sheet">
                    <div className="bottom-sheet__backdrop" />
                    <div className="bottom-sheet__panel">
                        <div className="bottom-sheet__header">
                            <h5 className="bottom-sheet__title">準備開始</h5>
                        </div>
                        <div className="bottom-sheet__body">
                            <p>請確認已準備好開始新對戰。</p>
                            <div className="d-flex flex-column gap-2 mb-3">
                                {state.players.map((player) => (
                                    <div key={player.id} className="d-flex justify-content-between">
                                        <span>{getPlayerDisplayName(player.id)}</span>
                                        <span>
                                            {readyStatus.confirmations.includes(player.id) ? '✅ 已準備' : '⏳ 等待中'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary w-100" onClick={confirmReady}>
                                我準備好了
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isGameEnded && (
                <div className="bottom-sheet">
                    <div className="bottom-sheet__backdrop" />
                    <div className={`bottom-sheet__panel ${isEndSheetCollapsed ? 'is-collapsed' : ''}`}>
                        {!isEndSheetCollapsed && (
                            <>
                                <div className="bottom-sheet__header">
                                    <button
                                        className="bottom-sheet__toggle"
                                        onClick={() => setIsEndSheetCollapsed(true)}
                                    >
                                        查看戰況
                                    </button>
                                </div>
                                <div className="bottom-sheet__body bottom-sheet__body--full">
                                    <div className="text-center mb-3">
                                        <h2 className="text-success mb-2">🎉 遊戲結束！</h2>
                                        <p className="fs-5 mb-0">獲勝者: <strong>{getPlayerDisplayName(state.winner)}</strong></p>
                                    </div>
                                    <div className="mb-4">
                                        {state.players.map((player) => (
                                            <div key={player.id} className="d-flex justify-content-between mb-1">
                                                <span className="fw-semibold">{getPlayerDisplayName(player.id)}</span>
                                                <span>魅力 {player.score?.charm || 0} / 藝妓 {player.score?.tokens || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-primary" onClick={handleReturnToLobby}>
                                            返回大廳
                                        </button>
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                requestRematch();
                                                setIsRematchRequested(true);
                                            }}
                                            disabled={isRematchRequested}
                                        >
                                            {isRematchRequested ? '等待對手...' : '再來一場'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        {isEndSheetCollapsed && (
                            <button
                                className="bottom-sheet__expand"
                                onClick={() => setIsEndSheetCollapsed(false)}
                            >
                                展開結算
                            </button>
                        )}
                    </div>
                </div>
            )}

            {needsResponse && pendingInteraction && (
                <PendingInteractionModal
                    interaction={pendingInteraction}
                    playerId={currentPlayerId}
                    players={state.players}
                    getCharmByGeishaId={(geishaId) => state.geishas.find((geisha) => geisha.id === geishaId)?.charmPoints ?? 0}
                    geishaSet={activeGeishaSet}
                    onResolve={sendGameAction}
                    activeMotionKind={activePendingMotionKind}
                    prefersReducedMotion={prefersReducedMotion}
                />
            )}
        </div>
    );
};

export default GameRoom;
