// src/components/game/PlayerHand.tsx
import React, { useMemo } from 'react';
import { ItemCard, GeishaSet } from "@newhandarky/hanakoji-game-types"
import { getItemCardImage } from '../../utils/gameData';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';
import {
    buildHandCardPresentation,
    buildRevealVisibleCardIds,
    splitOpeningDealSteps
} from './playerHandModel';
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
    const { selfDealSteps, opponentDealSteps } = useMemo(() => splitOpeningDealSteps(openingDealSteps), [openingDealSteps]);
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
                    {isOpeningDealActive && (
                        <div className="player-hand-deal-lanes" aria-hidden="true">
                            <div className="player-hand-deal-lane player-hand-deal-lane--opponent">
                                {opponentDealSteps.map((step) => {
                                    const cardImage = step.isMasked ? '' : getItemCardImage(step.card, geishaSet ?? 'default');
                                    return (
                                        <div
                                            key={step.id}
                                            className={`player-hand-deal-card player-hand-deal-card--opponent ${step.reducedMotion ? 'player-hand-deal-card--reduced' : ''} ${step.isMasked ? 'is-masked' : ''}`}
                                            style={{
                                                ['--deal-slot-index' as string]: `${step.slotIndex}`,
                                                ['--deal-slot-count' as string]: `${step.slotCount}`,
                                                ['--motion-delay' as string]: `${step.delayMs}ms`,
                                                ['--motion-duration' as string]: `${step.durationMs}ms`,
                                                backgroundImage: cardImage ? `url(${cardImage})` : 'none'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <div className="player-hand-deal-lane player-hand-deal-lane--self">
                                {selfDealSteps.map((step) => {
                                    const cardImage = step.isMasked ? '' : getItemCardImage(step.card, geishaSet ?? 'default');
                                    return (
                                        <div
                                            key={step.id}
                                            className={`player-hand-deal-card player-hand-deal-card--self ${step.reducedMotion ? 'player-hand-deal-card--reduced' : ''} ${step.isMasked ? 'is-masked' : ''}`}
                                            style={{
                                                ['--deal-slot-index' as string]: `${step.slotIndex}`,
                                                ['--deal-slot-count' as string]: `${step.slotCount}`,
                                                ['--motion-delay' as string]: `${step.delayMs}ms`,
                                                ['--motion-duration' as string]: `${step.durationMs}ms`,
                                                backgroundImage: cardImage ? `url(${cardImage})` : 'none'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {removalCues.length > 0 && (
                        <div className="player-hand-removal-cues" aria-hidden="true">
                            {removalCues.map((cue, index) => (
                                <div
                                    key={cue.id}
                                    className={`player-hand-removal-cue player-hand-removal-cue--${cue.owner} ${cue.reducedMotion ? 'player-hand-removal-cue--reduced' : ''}`}
                                    style={{
                                        ['--removal-index' as string]: `${index}`,
                                        ['--motion-delay' as string]: `${cue.delayMs}ms`,
                                        ['--motion-duration' as string]: `${cue.durationMs}ms`
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    <div className="player-hand-row">
                        {cards.map((card, index) => {
                            const center = (cards.length - 1) / 2;
                            const relativeIndex = index - center;
                            const absRelative = Math.abs(relativeIndex);
                            const stackLevel = cards.length - Math.round(absRelative);
                            const rotationDeg = relativeIndex * 5;
                            const presentation = buildHandCardPresentation({
                                card,
                                index,
                                geishaSet: geishaSet ?? 'default',
                                selectedIdSet,
                                focusedCardId,
                                isOpeningHandConcealed,
                                revealVisibleCardIds,
                                openingHandReveal,
                                drawMotionByCardId,
                                drawBackCueIds
                            });

                            return (
                                <button
                                    key={card.id}
                                    type="button"
                                    className={`item-card item-card--image item-card--hand ${
                                        presentation.isSelected ? 'selected' : ''
                                    } ${
                                        presentation.isFocused ? 'item-card--focused' : ''
                                    } ${
                                        highlightActive && highlightCardId === card.id ? 'item-card--new' : ''
                                    } ${
                                        drawMotionByCardId.has(card.id) ? 'item-card--motion-draw' : ''
                                    } ${
                                        prefersReducedMotion && drawMotionByCardId.has(card.id) ? 'item-card--motion-reduced' : ''
                                    } ${
                                        presentation.hasCardImage ? '' : 'item-card--missing-artwork'
                                    } ${
                                        presentation.isConcealedCard ? 'item-card--opening-concealed' : ''
                                    } ${
                                        isOpeningHandRevealing && !presentation.isConcealedCard ? 'item-card--opening-revealed' : ''
                                    }`}
                                    disabled={isOpeningHandInteractionBlocked}
                                    aria-pressed={presentation.isSelected}
                                    aria-label={presentation.ariaLabel}
                                    onClick={() => toggleCard(card)}
                                    style={{
                                        backgroundImage: presentation.backgroundImage,
                                        ['--fan-index' as string]: `${relativeIndex}`,
                                        ['--fan-rotate-deg' as string]: `${rotationDeg}deg`,
                                        ['--fan-abs-index' as string]: `${absRelative}`,
                                        ['--fan-z-index' as string]: `${stackLevel}`,
                                        ['--motion-delay' as string]: `${presentation.revealStep?.delayMs ?? presentation.drawMotionCue?.delayMs ?? 0}ms`,
                                        ['--motion-duration' as string]: `${presentation.revealStep?.durationMs ?? presentation.drawMotionCue?.durationMs ?? 0}ms`
                                    }}
                                >
                                    <div className="item-card__overlay" />
                                    {(presentation.isConcealedCard || presentation.isDrawBackVisible) && (
                                        <div className="item-card__opening-back" aria-hidden="true">
                                            <span />
                                        </div>
                                    )}
                                    {!presentation.isConcealedCard && !presentation.isDrawBackVisible && !presentation.hasCardImage && (
                                        <div className="item-card__fallback-label">{presentation.fallbackLabel}</div>
                                    )}
                                    {presentation.isSelected && (
                                        <div className="item-card__selected-check" aria-hidden="true">✓</div>
                                    )}
                                    {drawMotionByCardId.has(card.id) && (
                                        <div className="item-card__motion-glow" aria-hidden="true" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

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

                    <div className="player-hand-controls">
                        <button
                            type="button"
                            className="player-hand-controls__button"
                            onClick={() => moveFocus('prev')}
                            disabled={cards.length < 2}
                            aria-label="上一張手牌"
                        >
                            ←
                        </button>
                        <span className="player-hand-controls__status" aria-live="polite">
                            {cards.length === 0 ? '0 / 0' : `${Math.max(focusedIndex, 0) + 1} / ${cards.length}`}
                        </span>
                        <button
                            type="button"
                            className="player-hand-controls__button"
                            onClick={() => moveFocus('next')}
                            disabled={cards.length < 2}
                            aria-label="下一張手牌"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerHand;
