// src/components/game/GameBoard.tsx
import React, { useMemo } from 'react';
import CompetitionGroupModal from './CompetitionGroupModal';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';
import {
    GameState,
    GeishaSet
} from '@newhandarky/hanakoji-game-types';
import type { GameAction } from '@newhandarky/hanakoji-game-types';
import {
    buildCharmLookup,
    buildGeishaItemIconMap,
    buildPlayedCardCountMap,
    buildPlayerBoardContext,
    partitionBoardMotionCues,
    sortGeishasForBoard
} from './gameBoardModel';
import { useGeishaCoverflow } from './useGeishaCoverflow';
import { useGameBoardInteraction } from './useGameBoardInteraction';
import { GameBoardCharacterSection } from './GameBoardCharacterSection';
import { GameBoardHandActionsSection } from './GameBoardHandActionsSection';

interface GameBoardProps {
    // 全域遊戲狀態
    state: GameState;
    // 自己的玩家 ID
    playerId: string;
    // 房主 ID（用於陣營顏色）
    hostId: string;
    // 發送行動到伺服器
    onSendAction: (action: GameAction) => void;
    // 是否可操作（輪到自己且無互動阻擋）
    canAct: boolean;
    // 抽牌動畫卡片 ID
    highlightCardId?: string | null;
    // 是否啟用抽牌動畫
    highlightActive?: boolean;
    // 主棋盤目前啟用中的動態提示
    motionCues?: MotionCue[];
    openingDealSteps?: OpeningDealCueStep[];
    // 是否偏好低動作模式
    prefersReducedMotion?: boolean;
    // 目前房間聚焦區塊
    focusSection: FocusSection;
    openingHandReveal?: OpeningHandRevealModel | null;
    onTakeOpeningHand?: () => void;
}

export type FocusSection = 'info' | 'characterBoard' | 'handActions';

// 遊戲主棋盤與行動控制區
const GameBoard: React.FC<GameBoardProps> = ({
    state,
    playerId,
    onSendAction,
    canAct,
    highlightCardId,
    highlightActive,
    motionCues = [],
    openingDealSteps = [],
    prefersReducedMotion = false,
    focusSection,
    openingHandReveal = null,
    onTakeOpeningHand
}) => {
    const activeGeishaSet: GeishaSet = state.geishaSet ?? 'default';

    // 取得當前玩家與自己的狀態
    const isCharacterExpanded = focusSection === 'characterBoard';
    const isHandExpanded = focusSection === 'handActions';
    const {
        myState,
        opponentState,
        isMyTurn,
        isOpeningHandInteractionBlocked
    } = buildPlayerBoardContext(
        state,
        playerId,
        canAct,
        Boolean(openingHandReveal?.isInteractionBlocked)
    );

    const {
        isCompetitionModalOpen,
        competitionCards,
        handleAction,
        handleCompetitionConfirm,
        handleCompetitionClose,
        handleCardSelect
    } = useGameBoardInteraction({
        playerId,
        myState,
        isMyTurn,
        isOpeningHandInteractionBlocked,
        onSendAction
    });

    // 建立藝妓對應卡數量的索引表（快速查詢）
    const myCountMap = useMemo(() => {
        return buildPlayedCardCountMap(myState?.playedCards);
    }, [myState?.playedCards]);

    const opponentCountMap = useMemo(() => {
        return buildPlayedCardCountMap(opponentState?.playedCards);
    }, [opponentState?.playedCards]);

    const {
        boardMotionCues,
        handMotionCues,
        competitionResultMotionActive
    } = useMemo(() => partitionBoardMotionCues(motionCues), [motionCues]);

    const orderedGeishas = useMemo(() => sortGeishasForBoard(state.geishas), [state.geishas]);

    const geishaItemIconMap = useMemo(() => {
        return buildGeishaItemIconMap(orderedGeishas, activeGeishaSet);
    }, [orderedGeishas, activeGeishaSet]);

    const getCharmByGeishaId = useMemo(() => buildCharmLookup(state.geishas), [state.geishas]);
    const {
        activeGeishaIndex,
        handleCoverflowStep,
        handlePointerDown,
        releasePointerDrag,
        getCoverflowOffset
    } = useGeishaCoverflow(orderedGeishas.length);

    if (!myState) {
        return null;
    }

    return (
        <div className="game-focus-column">
            <GameBoardCharacterSection
                isExpanded={isCharacterExpanded}
                orderedGeishas={orderedGeishas}
                activeGeishaIndex={activeGeishaIndex}
                myCountMap={myCountMap}
                opponentCountMap={opponentCountMap}
                playerId={playerId}
                geishaItemIconMap={geishaItemIconMap}
                boardMotionCues={boardMotionCues}
                prefersReducedMotion={prefersReducedMotion}
                onCoverflowStep={handleCoverflowStep}
                onPointerDown={handlePointerDown}
                onPointerRelease={releasePointerDrag}
                getCoverflowOffset={getCoverflowOffset}
            />

            <GameBoardHandActionsSection
                isExpanded={isHandExpanded}
                canAct={canAct}
                isMyTurn={isMyTurn}
                isOpeningHandInteractionBlocked={isOpeningHandInteractionBlocked}
                myState={myState}
                highlightCardId={highlightCardId}
                highlightActive={highlightActive}
                getCharmByGeishaId={getCharmByGeishaId}
                activeGeishaSet={activeGeishaSet}
                handMotionCues={handMotionCues}
                prefersReducedMotion={prefersReducedMotion}
                openingDealSteps={openingDealSteps}
                openingHandReveal={openingHandReveal}
                onTakeOpeningHand={onTakeOpeningHand}
                onCardSelect={handleCardSelect}
                onAction={handleAction}
            />

            <CompetitionGroupModal
                isOpen={isCompetitionModalOpen}
                cards={competitionCards}
                onSelect={handleCompetitionConfirm}
                onClose={handleCompetitionClose}
                getCharmByGeishaId={getCharmByGeishaId}
                geishaSet={activeGeishaSet}
                showResultMotionHint={competitionResultMotionActive}
                prefersReducedMotion={prefersReducedMotion}
            />
        </div>
    );
};

export default GameBoard;
