
// src/components/game/GeishaCard.tsx
import React from 'react';
import { Geisha } from '../../types/game.types';

/**
 * GeishaCard 組件：顯示單張藝妓卡片
 */
interface Props {
    geisha: Geisha;
}

const GeishaCard: React.FC<Props> = ({ geisha }) => {
    // 根據控制方加上樣式
    const className = `geisha-card ${geisha.controlledBy === 'player1' ? 'player1' :
        geisha.controlledBy === 'player2' ? 'player2' : ""
        }`;

    return (
        <div className={className}>
            <h5>{geisha.name}</h5>
            <p>魅力值: {geisha.charmPoints}</p>
            {geisha.controlledBy && <span>🎴</span>}
        </div>
    );
};

export default GeishaCard;