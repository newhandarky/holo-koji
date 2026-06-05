// src/components/game/PlayerHand.tsx
import React, { useMemo } from 'react';
import { ItemCard, GeishaSet } from '@newhandarky/hanakoji-game-types';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';
import { buildRevealVisibleCardIds } from './playerHandModel';
import { PlayerHandCardRow } from './PlayerHandCardRow';
import { PlayerHandControls } from './PlayerHandControls';
import { PlayerHandDealLanes } from './PlayerHandDealLanes';
import { PlayerHandRemovalCues } from './PlayerHandRemovalCues';
import { usePlayerHandInteraction } from './usePlayerHandInteraction';

/**
 * PlayerHand 組件：顯示玩家手牌並支援選牌
 */
interface Props {
    cards: ItemCard[];
    onCardSelect: (cards: ItemCard[]) => void;
    highlightCardId?: string | null;                 // 新抽到的卡片 ID
    highlightActive?: boolean;                       // 是否啟用抽牌動畫
    getCharmByGeishaId?: (geishaId: number) => number; // 取得魅力值（以伺服器資料為主）
    geishaSet?: GeishaSet; // 藝妓組合
    motionCues?: MotionCue[];
    prefersReducedMotion?: boolean;
    openingDealSteps?: OpeningDealCueStep[];
    openingHandReveal?: OpeningHandRevealModel | null;
    onTakeOpeningHand?: () => void;
}

// 玩家手牌區顯示與選牌
const PlayerHand: React.FC<Props> = ({
    cards,
    onCardSelect,
    highlightCardId,
    highlightActive,
    getCharmByGeishaId,
    geishaSet,
    motionCues = [],
    prefersReducedMotion = false,
    openingDealSteps = [],
    openingHandReveal = null,
    onTakeOpeningHand
}) => {
    const removalCues = useMemo(() => motionCues.filter((cue) => cue.kind === 'removal'), [motionCues]);
    const isOpeningDealActive = openingDealSteps.length > 0;
    const isOpeningHandConcealed = Boolean(openingHandReveal?.isConcealed);
    const isOpeningHandRevealing = openingHandReveal?.status === 'revealing';
    const isOpeningHandInteractionBlocked = Boolean(openingHandReveal?.isInteractionBlocked);
    const revealVisibleCardIds = useMemo(() => buildRevealVisibleCardIds(openingHandReveal), [openingHandReveal]);
    const {
        selectedIdSet,
        focusedCardId,
        focusedIndex,
        drawBackCueIds,
        drawMotionByCardId,
        moveFocus,
        toggleCard
    } = usePlayerHandInteraction({
        cards,
        motionCues,
        isOpeningHandInteractionBlocked,
        onCardSelect
    });

    return (
        <div className="player-hand-panel">
            <div
                className={`player-hand-stage ${isOpeningDealActive ? 'player-hand-stage--deal-active' : ''}`}
                role="group"
                aria-label="手牌焦點切換"
            >
                <div className="player-hand-stage__content">
                    <PlayerHandDealLanes
                        openingDealSteps={openingDealSteps}
                        geishaSet={geishaSet ?? 'default'}
                    />
                    <PlayerHandRemovalCues removalCues={removalCues} />
                    <PlayerHandCardRow
                        cards={cards}
                        geishaSet={geishaSet ?? 'default'}
                        selectedIdSet={selectedIdSet}
                        focusedCardId={focusedCardId}
                        isOpeningHandConcealed={isOpeningHandConcealed}
                        revealVisibleCardIds={revealVisibleCardIds}
                        openingHandReveal={openingHandReveal}
                        drawMotionByCardId={drawMotionByCardId}
                        drawBackCueIds={drawBackCueIds}
                        highlightCardId={highlightCardId}
                        highlightActive={highlightActive}
                        prefersReducedMotion={prefersReducedMotion}
                        isOpeningHandRevealing={isOpeningHandRevealing}
                        isOpeningHandInteractionBlocked={isOpeningHandInteractionBlocked}
                        onToggleCard={toggleCard}
                    />

                    {openingHandReveal?.status === 'pending_take' && (
                        <div className="opening-hand-gate" role="status" aria-label="開局手牌可拿取">
                            <button
                                type="button"
                                className="opening-hand-gate__button"
                                onClick={onTakeOpeningHand}
                            >
                                拿取手牌
                            </button>
                        </div>
                    )}

                    <PlayerHandControls
                        cardsLength={cards.length}
                        focusedIndex={focusedIndex}
                        onMoveFocus={moveFocus}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerHand;
