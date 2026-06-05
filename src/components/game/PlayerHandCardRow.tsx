import React from 'react';
import { GeishaSet, ItemCard } from '@newhandarky/hanakoji-game-types';
import { MotionCue } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';
import { buildHandCardPresentation } from './playerHandModel';

interface PlayerHandCardRowProps {
    cards: ItemCard[];
    geishaSet: GeishaSet;
    selectedIdSet: Set<string>;
    focusedCardId: string | null;
    isOpeningHandConcealed: boolean;
    revealVisibleCardIds: Set<string>;
    openingHandReveal: OpeningHandRevealModel | null;
    drawMotionByCardId: Map<string, MotionCue>;
    drawBackCueIds: Set<string>;
    highlightCardId?: string | null;
    highlightActive?: boolean;
    prefersReducedMotion: boolean;
    isOpeningHandRevealing: boolean;
    isOpeningHandInteractionBlocked: boolean;
    onToggleCard: (card: ItemCard) => void;
}

export const PlayerHandCardRow: React.FC<PlayerHandCardRowProps> = ({
    cards,
    geishaSet,
    selectedIdSet,
    focusedCardId,
    isOpeningHandConcealed,
    revealVisibleCardIds,
    openingHandReveal,
    drawMotionByCardId,
    drawBackCueIds,
    highlightCardId,
    highlightActive,
    prefersReducedMotion,
    isOpeningHandRevealing,
    isOpeningHandInteractionBlocked,
    onToggleCard
}) => (
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
                geishaSet,
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
                    onClick={() => onToggleCard(card)}
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
);
