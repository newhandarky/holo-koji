
// src/components/game/GeishaCard.tsx
import React, { CSSProperties, useEffect, useState } from 'react';
import { Geisha } from "game-shared-types"
import { ItemIconDefinition } from '../../utils/gameData';
import { MotionCue } from './gameMotion';

export interface GeishaCardItemIconEntry {
    itemType: string;
    definition: ItemIconDefinition;
    owner: 'self' | 'opponent';
    count: number;
}

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
    // 角色卡上的道具 icon 摘要
    itemIcons?: GeishaCardItemIconEntry[];
    motionCues?: MotionCue[];
    prefersReducedMotion?: boolean;
}

const GeishaCard: React.FC<Props> = ({
    geisha,
    myCount,
    opponentCount,
    currentPlayerId,
    hostId,
    myCamp,
    opponentCamp,
    itemIcons = [],
    motionCues = [],
    prefersReducedMotion = false
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
                <div className="geisha-card__header">
                    <div className="geisha-card__nameplate">
                        <span className="geisha-card__name">{geisha.name}</span>
                        <span className="geisha-card__score-badge">魅力 {geisha.charmPoints}</span>
                    </div>
                    <span className="geisha-card__control">{controlLabel}</span>
                </div>
                <div className="geisha-card__details">
                    <div className="geisha-card__icon-area">
                        <span className="geisha-card__icon-title">對應道具</span>
                        {itemIcons.length > 0 ? (
                            <div className="geisha-card__icon-list">
                                {itemIcons.map((entry) => (
                                    <div
                                        key={`${geisha.id}-${entry.owner}-${entry.itemType}`}
                                        className={`geisha-card__icon-chip geisha-card__icon-chip--${entry.owner}`}
                                        title={`${entry.definition.label} x${entry.count}`}
                                    >
                                        {entry.definition.imageUrl ? (
                                            <img
                                                className="geisha-card__icon-image"
                                                src={entry.definition.imageUrl}
                                                alt={entry.definition.label}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className={`geisha-card__icon-glyph ${entry.definition.accentClassName}`}>
                                                {entry.definition.glyph}
                                            </span>
                                        )}
                                        <span className="geisha-card__icon-text">
                                            <span className="geisha-card__icon-label">{entry.definition.label}</span>
                                            <span className="geisha-card__icon-meta">
                                                {entry.owner === 'self' ? '我方' : '對手'} x{entry.count}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="geisha-card__icon-empty">尚無對應道具</span>
                        )}
                    </div>
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
