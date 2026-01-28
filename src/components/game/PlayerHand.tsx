// src/components/game/PlayerHand.tsx
import React, { useMemo, useState } from 'react';
import { ItemCard } from "game-shared-types"

/**
 * PlayerHand 組件：顯示玩家手牌並支援選牌
 */
interface Props {
    cards: ItemCard[];
    onCardSelect: (cards: ItemCard[]) => void;
}

// 玩家手牌區顯示與選牌
const PlayerHand: React.FC<Props> = ({ cards, onCardSelect }) => {
    // 本地維護選擇狀態
    const [selected, setSelected] = useState<ItemCard[]>([]);
    const selectedIdSet = useMemo(() => new Set(selected.map(card => card.id)), [selected]);

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
        <div className="d-flex flex-wrap">
            {cards.map(card => (
                <div
                    key={card.id}
                    className={`item-card ${selectedIdSet.has(card.id) ? 'selected' : ''}`}
                    onClick={() => toggleCard(card)}
                >
                    <p>藝妓 {card.geishaId}</p>
                    <small>{card.type}</small>
                </div>
            ))}
        </div>
    );
};

export default PlayerHand;
