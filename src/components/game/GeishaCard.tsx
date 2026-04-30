
// src/components/game/GeishaCard.tsx
import React, { useEffect, useState } from 'react';
import { Geisha } from "game-shared-types"

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
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [geisha.imageUrl]);

    // 根據控制方加上樣式（以玩家 ID 判斷陣營）
    const isHostControlled = Boolean(hostId) && geisha.controlledBy === hostId;
    const isMineControlled = Boolean(currentPlayerId) && geisha.controlledBy === currentPlayerId;
    const className = `geisha-card ${isHostControlled ? 'geisha-card--host' :
        geisha.controlledBy ? 'geisha-card--guest' : ""
        }`;
    const imageUrl = geisha.imageUrl?.trim() ?? '';
    const showArtwork = Boolean(imageUrl) && !imageFailed;
    const controlLabel = !geisha.controlledBy
        ? '未掌控'
        : isMineControlled
            ? '我方掌控'
            : '對手掌控';
    const myCountClassName = `geisha-card__count geisha-card__count--${myCamp}`;
    const opponentCountClassName = `geisha-card__count geisha-card__count--${opponentCamp}`;

    return (
        <div className={className}>
            <div className="geisha-card__media">
                {showArtwork ? (
                    <img
                        className="geisha-card__artwork"
                        src={imageUrl}
                        alt={`${geisha.name} 角色圖`}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className="geisha-card__fallback">
                        <span className="geisha-card__fallback-label">Artwork Unavailable</span>
                        <strong className="geisha-card__fallback-name">{geisha.name}</strong>
                        <span className="geisha-card__fallback-score">魅力 {geisha.charmPoints}</span>
                    </div>
                )}
                <div className="geisha-card__scrim" />
                <div className="geisha-card__header">
                    <div className="geisha-card__nameplate">
                        <span className="geisha-card__name">{geisha.name}</span>
                        <span className="geisha-card__score-badge">魅力 {geisha.charmPoints}</span>
                    </div>
                    <span className="geisha-card__control">{controlLabel}</span>
                </div>
                <div className="geisha-card__footer">
                    <div className={opponentCountClassName}>
                        <span className="geisha-card__count-label">對手</span>
                        <span className="geisha-card__count-value">{opponentCount}</span>
                    </div>
                    <div className={myCountClassName}>
                        <span className="geisha-card__count-label">我方</span>
                        <span className="geisha-card__count-value">{myCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeishaCard;
