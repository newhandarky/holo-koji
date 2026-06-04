import React from 'react';
import type {
    GameAction,
    GameState,
    GeishaSet,
    Player
} from '@newhandarky/hanakoji-game-types';
import GameBoard, { type FocusSection } from '../../components/game/GameBoard';
import type {
    MotionCue,
    OpeningDealCueStep
} from '../../components/game/gameMotion';
import type { OpeningHandRevealModel } from '../../components/game/openingHandRevealModel';
import { GameRoomInfoPanel } from './GameRoomInfoPanel';

const SECTION_TABS: Array<{ section: FocusSection; label: string }> = [
    { section: 'info', label: '資訊' },
    { section: 'characterBoard', label: '角色' },
    { section: 'handActions', label: '手牌&指令' }
];

type GameRoomActiveSurfaceProps = {
    state: GameState;
    gameSurfaceRef: React.RefObject<HTMLDivElement>;
    isInteractionLocked: boolean;
    isOpeningDealModalActive: boolean;
    focusSection: FocusSection;
    onFocusSectionChange: (section: FocusSection) => void;
    currentPlayerId: string;
    currentPlayer: Player | null;
    hostId: string | null;
    activeTurnPlayerName: string;
    displayName: string;
    activeGeishaSet: GeishaSet;
    getPlayerDisplayName: (playerId?: string) => string;
    getPlayerAvatar: (playerId?: string) => string;
    onReturnToLobby: () => void;
    onSendAction: (action: GameAction) => void;
    canAct: boolean;
    highlightCardId: string | null;
    highlightActive: boolean;
    motionCues: MotionCue[];
    prefersReducedMotion: boolean;
    openingDealSteps: OpeningDealCueStep[];
    openingHandReveal: OpeningHandRevealModel | null;
    onTakeOpeningHand: () => void;
};

export const GameRoomActiveSurface = ({
    state,
    gameSurfaceRef,
    isInteractionLocked,
    isOpeningDealModalActive,
    focusSection,
    onFocusSectionChange,
    currentPlayerId,
    currentPlayer,
    hostId,
    activeTurnPlayerName,
    displayName,
    activeGeishaSet,
    getPlayerDisplayName,
    getPlayerAvatar,
    onReturnToLobby,
    onSendAction,
    canAct,
    highlightCardId,
    highlightActive,
    motionCues,
    prefersReducedMotion,
    openingDealSteps,
    openingHandReveal,
    onTakeOpeningHand
}: GameRoomActiveSurfaceProps) => (
    <div className="container-fluid">
        <div
            ref={gameSurfaceRef}
            className={`card game-card game-room-surface p-2 ${isInteractionLocked ? 'game-card--locked' : ''} game-room-focus-layout`}
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
                            onClick={() => onFocusSectionChange(tab.section)}
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
                        hostId={hostId ?? ''}
                        activeTurnPlayerName={activeTurnPlayerName}
                        displayName={displayName}
                        activeGeishaSet={activeGeishaSet}
                        getPlayerDisplayName={getPlayerDisplayName}
                        getPlayerAvatar={getPlayerAvatar}
                        onReturnToLobby={onReturnToLobby}
                    />
                )}
            </section>

            <GameBoard
                state={state}
                playerId={currentPlayerId}
                hostId={hostId ?? ''}
                onSendAction={onSendAction}
                canAct={canAct}
                highlightCardId={highlightCardId}
                highlightActive={highlightActive}
                motionCues={motionCues}
                prefersReducedMotion={prefersReducedMotion}
                focusSection={focusSection}
                openingDealSteps={openingDealSteps}
                openingHandReveal={openingHandReveal}
                onTakeOpeningHand={onTakeOpeningHand}
            />
        </div>
    </div>
);
