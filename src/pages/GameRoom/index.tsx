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
import { GameRoomDrawNotification } from './GameRoomDrawNotification';
import { GameRoomRoundSummaryOverlay } from './GameRoomRoundSummaryOverlay';
import { GameRoomReadySheet } from './GameRoomReadySheet';
import { GameRoomEndSheet } from './GameRoomEndSheet';

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

            <GameRoomDrawNotification
                recentDraw={recentDraw}
                isActiveSelfDrawNotification={isActiveSelfDrawNotification}
                onDismiss={handleDrawNotificationDismiss}
                onViewNow={handleDrawNotificationViewNow}
                onKeyDown={handleDrawNotificationKeyDown}
            />

            <OpeningDealModal
                isOpen={isOpeningDealModalActive}
                model={openingDealModalModel}
                onComplete={handleOpeningDealModalComplete}
            />

            {roundSummary && (
                <GameRoomRoundSummaryOverlay
                    roundSummary={roundSummary}
                    players={state.players}
                    getPlayerDisplayName={getPlayerDisplayName}
                />
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
                <GameRoomReadySheet
                    readyStatus={readyStatus}
                    players={state.players}
                    getPlayerDisplayName={getPlayerDisplayName}
                    onConfirmReady={confirmReady}
                />
            )}

            {statusModel.isGameEnded && (
                <GameRoomEndSheet
                    players={state.players}
                    winner={state.winner}
                    isCollapsed={isEndSheetCollapsed}
                    isRematchRequested={isRematchRequested}
                    getPlayerDisplayName={getPlayerDisplayName}
                    onCollapse={() => setIsEndSheetCollapsed(true)}
                    onExpand={() => setIsEndSheetCollapsed(false)}
                    onReturnToLobby={handleReturnToLobby}
                    onRequestRematch={() => {
                        requestRematch();
                        setIsRematchRequested(true);
                    }}
                />
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
