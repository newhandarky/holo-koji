
// src/components/game/GeishaCard.tsx
import React from 'react';
import { Geisha, GeishaSetKey } from "game-shared-types"
import { getGeishaImageById } from '../../utils/gameData';

/**
 * GeishaCard 組件：顯示單張藝妓卡片
 */
interface Props {
    // 藝妓資料
    geisha: Geisha;
    // 自己在該藝妓的卡牌數量
    myCount: number;
    // 對手在該藝妓的卡牌數量
    opponentCount: number;
    // 自己的玩家 ID
    currentPlayerId: string;
    // 房主 ID（用於陣營顏色）
    hostId: string;
    // 自己的陣營
    myCamp: 'host' | 'guest';
    // 對手的陣營
    opponentCamp: 'host' | 'guest';
    // 藝妓組合
    geishaSet?: GeishaSetKey;
}

const GeishaCard: React.FC<Props> = ({
    geisha,
    myCount,
    opponentCount,
    currentPlayerId,
    hostId,
    myCamp,
    opponentCamp,
    geishaSet
}) => {
    // 根據控制方加上樣式（以玩家 ID 判斷陣營）
    const isHostControlled = Boolean(hostId) && geisha.controlledBy === hostId;
    const className = `geisha-card ${isHostControlled ? 'geisha-card--host' :
        geisha.controlledBy ? 'geisha-card--guest' : ""
        }`;
    // 藝妓背景圖片
    const imageUrl = getGeishaImageById(geisha.id, geishaSet ?? 'default');

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
