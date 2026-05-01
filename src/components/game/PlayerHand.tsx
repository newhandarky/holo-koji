// src/components/game/PlayerHand.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { ItemCard, GeishaSetKey } from "game-shared-types"
import { getItemCardImage, getGeishaCharmById } from '../../utils/gameData';
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
    geishaSet?: GeishaSetKey; // 藝妓組合
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

    // 切換卡片選取狀態（使用 functional setState 避免快速點擊丟更新）
    const toggleCard = (card: ItemCard) => {
        setSelected((prevSelected) => {
            const exists = prevSelected.some(c => c.id === card.id);
            const nextSelected = exists
                ? prevSelected.filter(c => c.id !== card.id)
                : [...prevSelected, card];

            onCardSelect(nextSelected);
            return nextSelected;
        });
    };

    return (
        <div className="player-hand-row">
            {cards.map(card => (
                <div
                    key={card.id}
                    className={`item-card item-card--image item-card--hand ${
                        selectedIdSet.has(card.id) ? 'selected' : ''
                    } ${
                        highlightActive && highlightCardId === card.id ? 'item-card--new' : ''
                    } ${
                        drawMotionByCardId.has(card.id) ? 'item-card--motion-draw' : ''
                    } ${
                        prefersReducedMotion && drawMotionByCardId.has(card.id) ? 'item-card--motion-reduced' : ''
                    }`}
                    onClick={() => toggleCard(card)}
                    style={{
                        backgroundImage: `url(${getItemCardImage(card, geishaSet ?? 'default')})`,
                        ['--motion-delay' as string]: `${drawMotionByCardId.get(card.id)?.delayMs ?? 0}ms`,
                        ['--motion-duration' as string]: `${drawMotionByCardId.get(card.id)?.durationMs ?? 0}ms`
                    }}
                >
                    <div className="item-card__overlay" />
                    <div className="item-card__badge">魅力 {getCharmByGeishaId?.(card.geishaId) ?? getGeishaCharmById(card.geishaId)}</div>
                    {drawMotionByCardId.has(card.id) && (
                        <div className="item-card__motion-glow" aria-hidden="true" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default PlayerHand;
