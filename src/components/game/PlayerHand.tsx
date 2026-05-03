// src/components/game/PlayerHand.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ItemCard, GeishaSet } from "game-shared-types"
import { getItemCardImage, getItemCardLabel, getGeishaCharmById } from '../../utils/gameData';
import { MotionCue } from './gameMotion';

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
    prefersReducedMotion = false
}) => {
    // 本地維護選擇狀態
    const [selected, setSelected] = useState<ItemCard[]>([]);
    // 本地維護焦點卡片（扇形內局部放大）
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
    const previousCardIdsRef = useRef<string[]>([]);
    // 已選卡片 ID 集合（快速判斷是否選取）
    const selectedIdSet = useMemo(() => new Set(selected.map(card => card.id)), [selected]);
    // 手牌 ID 組合鍵（用於偵測手牌變更）
    const cardIdsKey = useMemo(() => cards.map(card => card.id).join('|'), [cards]);
    const drawMotionByCardId = useMemo(() => {
        const map = new Map<string, MotionCue>();
        motionCues
            .filter((cue) => cue.kind === 'draw' && cue.cardId)
            .forEach((cue) => map.set(cue.cardId!, cue));
        return map;
    }, [motionCues]);

    // 當手牌變更時重置選牌狀態，避免選到舊牌
    useEffect(() => {
        setSelected([]);
        onCardSelect([]);
    }, [cardIdsKey, onCardSelect]);

    // 首次進入手牌時聚焦中間牌；手牌更新時優先保留舊焦點，否則取最接近的牌。
    useEffect(() => {
        const previousCardIds = previousCardIdsRef.current;

        if (cards.length === 0) {
            setFocusedCardId(null);
            previousCardIdsRef.current = [];
            return;
        }

        setFocusedCardId((previousFocusedCardId) => {
            if (!previousFocusedCardId) {
                return cards[Math.floor((cards.length - 1) / 2)]?.id ?? null;
            }

            const existingIndex = cards.findIndex((card) => card.id === previousFocusedCardId);
            if (existingIndex >= 0) {
                return previousFocusedCardId;
            }

            const previousIndex = previousCardIds.indexOf(previousFocusedCardId);
            if (previousIndex < 0) {
                return cards[Math.floor((cards.length - 1) / 2)]?.id ?? null;
            }

            const nearestIndex = Math.min(previousIndex, cards.length - 1);
            return cards[nearestIndex]?.id ?? cards[cards.length - 1]?.id ?? null;
        });
        previousCardIdsRef.current = cards.map((card) => card.id);
    }, [cards, cardIdsKey]);

    const focusedIndex = useMemo(() => {
        if (!focusedCardId) {
            return cards.length > 0 ? Math.floor((cards.length - 1) / 2) : -1;
        }

        const index = cards.findIndex((card) => card.id === focusedCardId);
        if (index >= 0) {
            return index;
        }

        return cards.length > 0 ? Math.floor((cards.length - 1) / 2) : -1;
    }, [cards, focusedCardId]);

    const moveFocus = (direction: 'prev' | 'next') => {
        if (cards.length === 0) {
            return;
        }

        const currentIndex = focusedIndex >= 0 ? focusedIndex : Math.floor((cards.length - 1) / 2);
        const offset = direction === 'prev' ? -1 : 1;
        const nextIndex = (currentIndex + offset + cards.length) % cards.length;
        setFocusedCardId(cards[nextIndex]?.id ?? null);
    };

    // 切換卡片選取狀態（使用 functional setState 避免快速點擊丟更新）
    const toggleCard = (card: ItemCard) => {
        setSelected((prevSelected) => {
            setFocusedCardId(card.id);
            const exists = prevSelected.some(c => c.id === card.id);
            const nextSelected = exists
                ? prevSelected.filter(c => c.id !== card.id)
                : [...prevSelected, card];

            onCardSelect(nextSelected);
            return nextSelected;
        });
    };

    return (
        <div className="player-hand-panel">
            <div className="player-hand-stage" role="group" aria-label="手牌焦點切換">
                <div className="player-hand-stage__content">
                    <div className="player-hand-row">
                        {cards.map((card, index) => {
                            const center = (cards.length - 1) / 2;
                            const relativeIndex = index - center;
                            const absRelative = Math.abs(relativeIndex);
                            const stackLevel = cards.length - Math.round(absRelative);
                            const rotationDeg = relativeIndex * 5;
                            const cardImage = getItemCardImage(card, geishaSet ?? 'default');
                            const hasCardImage = cardImage.trim().length > 0;
                            const fallbackLabel = getItemCardLabel(card, geishaSet ?? 'default');
                            const isSelected = selectedIdSet.has(card.id);
                            const isFocused = focusedCardId === card.id;

                            return (
                                <button
                                    key={card.id}
                                    type="button"
                                    className={`item-card item-card--image item-card--hand ${
                                        isSelected ? 'selected' : ''
                                    } ${
                                        isFocused ? 'item-card--focused' : ''
                                    } ${
                                        highlightActive && highlightCardId === card.id ? 'item-card--new' : ''
                                    } ${
                                        drawMotionByCardId.has(card.id) ? 'item-card--motion-draw' : ''
                                    } ${
                                        prefersReducedMotion && drawMotionByCardId.has(card.id) ? 'item-card--motion-reduced' : ''
                                    } ${
                                        hasCardImage ? '' : 'item-card--missing-artwork'
                                    }`}
                                    aria-pressed={isSelected}
                                    onClick={() => toggleCard(card)}
                                    style={{
                                        backgroundImage: hasCardImage ? `url(${cardImage})` : 'none',
                                        ['--fan-index' as string]: `${relativeIndex}`,
                                        ['--fan-rotate-deg' as string]: `${rotationDeg}deg`,
                                        ['--fan-abs-index' as string]: `${absRelative}`,
                                        ['--fan-z-index' as string]: `${stackLevel}`,
                                        ['--motion-delay' as string]: `${drawMotionByCardId.get(card.id)?.delayMs ?? 0}ms`,
                                        ['--motion-duration' as string]: `${drawMotionByCardId.get(card.id)?.durationMs ?? 0}ms`
                                    }}
                                >
                                    <div className="item-card__overlay" />
                                    {!hasCardImage && (
                                        <div className="item-card__fallback-label">{fallbackLabel}</div>
                                    )}
                                    <div className="item-card__badge">魅力 {getCharmByGeishaId?.(card.geishaId) ?? getGeishaCharmById(card.geishaId)}</div>
                                    {isSelected && (
                                        <div className="item-card__selected-check" aria-hidden="true">✓</div>
                                    )}
                                    {drawMotionByCardId.has(card.id) && (
                                        <div className="item-card__motion-glow" aria-hidden="true" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

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
