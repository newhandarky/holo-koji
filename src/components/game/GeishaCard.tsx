
// src/components/game/GeishaCard.tsx
import React from 'react';
import { Geisha } from "game-shared-types"
import { getGeishaImageById } from '../../utils/gameData';

/**
 * GeishaCard 組件：顯示單張藝妓卡片
 */
interface Props {
    geisha: Geisha;
    myCount: number;
    opponentCount: number;
    currentPlayerId: string;
    hostId: string;
    myCamp: 'host' | 'guest';
    opponentCamp: 'host' | 'guest';
}

const GeishaCard: React.FC<Props> = ({
    geisha,
    myCount,
    opponentCount,
    currentPlayerId,
    hostId,
    myCamp,
    opponentCamp
}) => {
    // 根據控制方加上樣式（以玩家 ID 判斷陣營）
    const isHostControlled = Boolean(hostId) && geisha.controlledBy === hostId;
    const className = `geisha-card ${isHostControlled ? 'geisha-card--host' :
        geisha.controlledBy ? 'geisha-card--guest' : ""
        }`;
    const imageUrl = getGeishaImageById(geisha.id);

    return (
        <div
            className={className}
            style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
        >
            <div className="geisha-card__overlay" />
            <div className="geisha-card__score-badge">魅力 {geisha.charmPoints}</div>
            <div className="geisha-score-row">
                <div className="geisha-score geisha-score--opponent">
                    {Array.from({ length: opponentCount }).map((_, index) => (
                        <span
                            key={`opp-${geisha.id}-${index}`}
                            className={`geisha-score-chip geisha-score-chip--${opponentCamp}`}
                        />
                    ))}
                </div>
                <div className="geisha-score geisha-score--mine">
                    {Array.from({ length: myCount }).map((_, index) => (
                        <span
                            key={`mine-${geisha.id}-${index}`}
                            className={`geisha-score-chip geisha-score-chip--${myCamp}`}
                        />
                    ))}
                </div>
            </div>
            {geisha.controlledBy && <span>🎴</span>}
        </div>
    );
};

export default GeishaCard;
