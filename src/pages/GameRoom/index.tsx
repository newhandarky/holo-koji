// src/pages/GameRoom/index.tsx - 添加順序決定彈窗
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import GameBoard from '../../components/game/GameBoard';
import type { FocusSection } from '../../components/game/GameBoard';
import OpeningDealModal from '../../components/game/OpeningDealModal';
import OrderDecisionModal from '../../components/game/OrderDecisionModal';
import PendingInteractionModal from '../../components/game/PendingInteractionModal';
import {
    usePrefersReducedMotion
} from '../../components/game/gameMotion';
import config from '../../config/environment';
import { GeishaSet } from "@newhandarky/hanakoji-game-types"
import { buildGameRoomStatusModel } from './gameRoomStatusModel';
import { useGameRoomPlayers } from './useGameRoomPlayers';
import { useGameRoomDrawPresentation } from './useGameRoomDrawPresentation';
import { useGameRoomEventReactions } from './useGameRoomEventReactions';
import { useGameRoomOpeningPresentation } from './useGameRoomOpeningPresentation';
import { useGameRoomInviteActions } from './useGameRoomInviteActions';
import { GameRoomWaitingPanel } from './GameRoomWaitingPanel';
import { GameRoomInfoPanel } from './GameRoomInfoPanel';

const SECTION_TABS: Array<{ section: FocusSection; label: string }> = [
    { section: 'info', label: '資訊' },
    { section: 'characterBoard', label: '角色' },
    { section: 'handActions', label: '手牌&指令' }
];

// 遊戲房間主畫面
const GameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { state } = useGame();
    // 當前玩家 ID（從 localStorage 取得）
    const [currentPlayerId] = useState(() => localStorage.getItem('currentPlayerId') ?? '');
    const [localLineName] = useState(() => localStorage.getItem('lineDisplayName') ?? '');
    const [localLineAvatar] = useState(() => localStorage.getItem('lineAvatarUrl') ?? '');
    const {
        hostId,
        currentPlayer,
        playerProfile,
        getPlayerDisplayName,
        getPlayerAvatar,
        displayName,
        displayAvatar
    } = useGameRoomPlayers({
        state,
        currentPlayerId,
        localLineName,
        localLineAvatar
    });
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
        dealQueue,
        consumeDealEvent,
        drawQueue,
        consumeDrawEvent
    } = useWebSocket(roomId ?? null, playerProfile);
    const activeGeishaSet: GeishaSet = state.geishaSet ?? 'default';
    // 再來一場送出狀態
    const [isRematchRequested, setIsRematchRequested] = useState(false);
    // 結算底部視窗是否收合
    const [isEndSheetCollapsed, setIsEndSheetCollapsed] = useState(false);
    const [focusSection, setFocusSection] = useState<FocusSection>('characterBoard');
    const prefersReducedMotion = usePrefersReducedMotion();
    const {
        showRoomCode,
        inviteOutcome,
        toggleRoomCode,
        copyRoomCode,
        handleShareRoomInvite,
        openLineInvite
    } = useGameRoomInviteActions({ roomId });

    // 玩家確認順序
    const handleConfirmOrder = () => {
        confirmOrder();
    };

    const handleReturnToLobby = useCallback(() => {
        leaveRoom();
        navigate(roomId ? `/?roomId=${encodeURIComponent(roomId)}` : '/');
    }, [leaveRoom, navigate, roomId]);

    const {
        activeOpeningDealSteps,
        openingDealModalModel,
        isOpeningDealModalActive,
        isOpeningDealActive,
        openingHandRevealModel,
        isOpeningHandRevealBlocking,
        handleOpeningDealModalComplete,
        handleTakeOpeningHand
    } = useGameRoomOpeningPresentation({
        state,
        roomId,
        currentPlayerId,
        currentPlayer,
        dealQueue,
        consumeDealEvent,
        prefersReducedMotion,
        setFocusSection
    });

    const pendingInteraction = state.pendingInteraction;
    const statusModel = buildGameRoomStatusModel({
        state,
        currentPlayerId,
        isOpeningDealActive,
        isOpeningHandRevealBlocking,
        hasRoundSummary: Boolean(roundSummary),
        hasReadyStatus: Boolean(readyStatus)
    });
    const {
        activeMotionCues,
        activePendingMotionKind,
        enqueueMotionCues,
        gameSurfaceRef,
        setShouldHoldFocusForSelfDrawFlag
    } = useGameRoomEventReactions({
        state,
        roomId,
        currentPlayerId,
        isConnected,
        isRematchRequested,
        setIsRematchRequested,
        setIsEndSheetCollapsed,
        focusSection,
        setFocusSection,
        canAct: statusModel.canAct,
        isInteractionLocked: statusModel.isInteractionLocked,
        isOpeningDealModalActive,
        prefersReducedMotion
    });
    const activeTurnPlayerName = getPlayerDisplayName(statusModel.activeTurnPlayerId);
    const {
        recentDraw,
        drawHighlightCardId,
        isDrawHighlightActive,
        isActiveSelfDrawNotification,
        shouldHoldFocusForSelfDraw,
        handleDrawNotificationDismiss,
        handleDrawNotificationViewNow,
        handleDrawNotificationKeyDown
    } = useGameRoomDrawPresentation({
        drawQueue,
        consumeDrawEvent,
        currentPlayerId,
        focusSection,
        setFocusSection,
        isInteractionLocked: statusModel.isInteractionLocked,
        getPlayerDisplayName,
        enqueueMotionCues,
        prefersReducedMotion
    });
    setShouldHoldFocusForSelfDrawFlag(shouldHoldFocusForSelfDraw);

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

    if (statusModel.isWaiting) {
        return (
            <GameRoomWaitingPanel
                state={state}
                roomId={roomId}
                displayName={displayName}
                displayAvatar={displayAvatar}
                isMyTurn={statusModel.isMyTurn}
                showRoomCode={showRoomCode}
                inviteOutcome={inviteOutcome}
                getPlayerDisplayName={getPlayerDisplayName}
                onToggleRoomCode={toggleRoomCode}
                onCopyRoomCode={copyRoomCode}
                onShareRoomInvite={handleShareRoomInvite}
                onOpenLineInvite={openLineInvite}
                onReturnToLobby={handleReturnToLobby}
            />
        );
    }

    return (
        <div className="game-background game-room-page p-3">
            <div className="container-fluid">
                <div
                    ref={gameSurfaceRef}
                    className={`card game-card game-room-surface p-2 ${statusModel.isInteractionLocked ? 'game-card--locked' : ''} game-room-focus-layout`}
                    aria-hidden={isOpeningDealModalActive ? true : undefined}
                >
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
                            <GameRoomInfoPanel
                                state={state}
                                currentPlayerId={currentPlayerId}
                                currentPlayer={currentPlayer}
                                hostId={hostId}
                                activeTurnPlayerName={activeTurnPlayerName}
                                displayName={displayName}
                                activeGeishaSet={activeGeishaSet}
                                getPlayerDisplayName={getPlayerDisplayName}
                                getPlayerAvatar={getPlayerAvatar}
                                onReturnToLobby={handleReturnToLobby}
                            />
                        )}
                    </section>

                    <GameBoard
                        state={state}
                        playerId={currentPlayerId}
                        hostId={hostId}
                        onSendAction={sendGameAction}
                        canAct={statusModel.canAct}
                        highlightCardId={drawHighlightCardId}
                        highlightActive={isDrawHighlightActive}
                        motionCues={activeMotionCues}
                        prefersReducedMotion={prefersReducedMotion}
                        focusSection={focusSection}
                        openingDealSteps={activeOpeningDealSteps}
                        openingHandReveal={openingHandRevealModel.isEligible || openingHandRevealModel.status === 'revealed' ? openingHandRevealModel : null}
                        onTakeOpeningHand={handleTakeOpeningHand}
                    />
                </div>
            </div>

            {recentDraw && (
                <div className="draw-toast shadow">{recentDraw}</div>
            )}

            {isActiveSelfDrawNotification && (
                <div className="draw-notification shadow" role="status" aria-label="抽牌通知">
                    <div className="draw-notification__card-back" aria-hidden="true">
                        <span />
                    </div>
                    <div className="draw-notification__content">
                        <div className="draw-notification__title">你抽到一張新牌</div>
                        <div className="draw-notification__actions">
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={handleDrawNotificationDismiss}
                                onKeyDown={(event) => handleDrawNotificationKeyDown(event, 'dismiss')}
                            >
                                稍後確認
                            </button>
                            <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={handleDrawNotificationViewNow}
                                onKeyDown={(event) => handleDrawNotificationKeyDown(event, 'view_now')}
                            >
                                現在查看
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <OpeningDealModal
                isOpen={isOpeningDealModalActive}
                model={openingDealModalModel}
                onComplete={handleOpeningDealModalComplete}
            />

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

            {statusModel.isGameEnded && (
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

            {statusModel.needsResponse && pendingInteraction && (
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
