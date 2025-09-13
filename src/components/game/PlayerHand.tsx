// src/components/game/PlayerHand.tsx
import React, { useState } from 'react';
import { ItemCard } from '../../types/game.types';

/**
 * PlayerHand 組件：顯示玩家手牌並支援選牌
 */
interface Props {
    cards: ItemCard[];
    onCardSelect: (cards: ItemCard[]) => void;
}

const PlayerHand: React.FC<Props> = ({ cards, onCardSelect }) => {
    // 本地維護選擇狀態
    const [selected, setSelected] = useState<ItemCard[]>([]);

    const toggleCard = (card: ItemCard) => {
        let newSel;
        if (selected.some(c => c.id === card.id)) {
            newSel = selected.filter(c => c.id !== card.id);
        } else {
            newSel = [...selected, card];
        }
        setSelected(newSel);
        onCardSelect(newSel);
    };

    return (
        <div className="d-flex flex-wrap">
            {cards.map(card => (
                <div
                    key={card.id}
                    className={`item-card ${selected.some(c => c.id === card.id) ? 'selected' : ''}`}
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