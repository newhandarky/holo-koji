
// src/components/game/GeishaCard.tsx
import React, { CSSProperties, useEffect, useState } from 'react';
import { Geisha } from "@newhandarky/hanakoji-game-types";
import { ItemIconDefinition } from '../../utils/gameData';
import { MotionCue } from './gameMotion';

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
    isFocused?: boolean;
    // 對應場上位置的道具 icon
    itemIcon?: ItemIconDefinition | null;
    motionCues?: MotionCue[];
    prefersReducedMotion?: boolean;
}

const GeishaCard: React.FC<Props> = ({
    geisha,
    myCount,
    opponentCount,
    currentPlayerId,
    isFocused = false,
    itemIcon = null,
    motionCues = [],
    prefersReducedMotion = false
}) => {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [geisha.imageUrl]);

    const isMineControlled = Boolean(currentPlayerId) && geisha.controlledBy === currentPlayerId;
    const isOpponentControlled = Boolean(geisha.controlledBy) && !isMineControlled;
    const className = `geisha-card ${isFocused ? 'geisha-card--focused' : ''} ${isMineControlled ? 'geisha-card--self-controlled' :
        isOpponentControlled ? 'geisha-card--opponent-controlled' : ''
        }`;
    const imageUrl = geisha.imageUrl?.trim() ?? '';
    const showArtwork = Boolean(imageUrl) && !imageFailed;
    const hasActiveMotion = motionCues.length > 0;
    const cardClassName = `${className} ${hasActiveMotion ? 'geisha-card--motion-active' : ''} ${prefersReducedMotion && hasActiveMotion ? 'geisha-card--motion-reduced' : ''}`;
    const renderMotionLabel = (cue: MotionCue) => {
        if (cue.kind === 'gift-result') return cue.owner === 'self' ? '贈予入場' : '對手贈予';
        if (cue.kind === 'competition-result') return cue.owner === 'self' ? '競爭入場' : '對手競爭';
        return cue.owner === 'self' ? '我方出牌' : '對手出牌';
    };

    return (
        <div className={cardClassName}>
            <div className="geisha-card__media">
                {motionCues.length > 0 && (
                    <div className="geisha-card__motion-layer" aria-hidden="true">
                        {motionCues.map((cue) => {
                            const style = {
                                ['--motion-delay' as string]: `${cue.delayMs}ms`,
                                ['--motion-duration' as string]: `${cue.durationMs}ms`
                            } as CSSProperties;

                            return (
                                <div
                                    key={cue.id}
                                    className={`geisha-card__motion-cue geisha-card__motion-cue--${cue.kind} geisha-card__motion-cue--from-${cue.sourceZone}`}
                                    style={style}
                                >
                                    <span className="geisha-card__motion-chip">{renderMotionLabel(cue)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
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
                <div className="geisha-card__overlay">
                    <div className="geisha-card__overlay-content">
                        <span className="geisha-card__name">{geisha.name}</span>
                        <div className="geisha-card__overlay-meta">
                            {itemIcon ? (
                                <span className="geisha-card__slot-icon-wrap">
                                    <span className="geisha-card__slot-icon" title={itemIcon.label}>
                                        {itemIcon.imageUrl ? (
                                            <img
                                                className="geisha-card__slot-icon-image"
                                                src={itemIcon.imageUrl}
                                                alt={itemIcon.label}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className={`geisha-card__slot-icon-glyph ${itemIcon.accentClassName}`}>
                                                {itemIcon.glyph}
                                            </span>
                                        )}
                                    </span>
                                    <span className="geisha-card__charm-badge">{geisha.charmPoints}</span>
                                </span>
                            ) : (
                                <span className="geisha-card__slot-icon-wrap">
                                    <span className="geisha-card__slot-icon-fallback">?</span>
                                    <span className="geisha-card__charm-badge">{geisha.charmPoints}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="geisha-card__footer">
                    <div className="geisha-card__count geisha-card__count--self">
                        <span className="geisha-card__count-label">我方</span>
                        <span className="geisha-card__count-value">{myCount}</span>
                    </div>
                    <div className="geisha-card__count geisha-card__count--opponent">
                        <span className="geisha-card__count-label">對手</span>
                        <span className="geisha-card__count-value">{opponentCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeishaCard;
