import React from 'react';
import { Geisha } from '@newhandarky/hanakoji-game-types';
import GeishaCard from './GeishaCard';
import { MotionCue } from './gameMotion';
import { ItemIconDefinition } from '../../utils/gameData';

interface GameBoardCharacterSectionProps {
    isExpanded: boolean;
    orderedGeishas: Geisha[];
    activeGeishaIndex: number;
    myCountMap: Map<number, number>;
    opponentCountMap: Map<number, number>;
    playerId: string;
    geishaItemIconMap: Map<number, ItemIconDefinition>;
    boardMotionCues: MotionCue[];
    prefersReducedMotion: boolean;
    onCoverflowStep: (direction: 'prev' | 'next') => void;
    onPointerDown: React.PointerEventHandler<HTMLDivElement>;
    onPointerRelease: React.PointerEventHandler<HTMLDivElement>;
    getCoverflowOffset: (index: number) => number;
}

export const GameBoardCharacterSection: React.FC<GameBoardCharacterSectionProps> = ({
    isExpanded,
    orderedGeishas,
    activeGeishaIndex,
    myCountMap,
    opponentCountMap,
    playerId,
    geishaItemIconMap,
    boardMotionCues,
    prefersReducedMotion,
    onCoverflowStep,
    onPointerDown,
    onPointerRelease,
    getCoverflowOffset
}) => (
    <section className={`game-focus-section ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
        {isExpanded && (
            <section className="geisha-coverflow mt-2 mb-4" aria-label="人物卡 coverflow">
                <div className="geisha-coverflow__header">
                    <div className="geisha-coverflow__summary">
                        <span className="geisha-coverflow__eyebrow">人物卡</span>
                        <span className="geisha-coverflow__position">
                            {orderedGeishas.length > 0 ? `${activeGeishaIndex + 1} / ${orderedGeishas.length}` : '0 / 0'}
                        </span>
                    </div>
                </div>
                <div className="geisha-coverflow__stage">
                    <button
                        type="button"
                        className="geisha-coverflow__nav geisha-coverflow__nav--prev"
                        onClick={() => onCoverflowStep('prev')}
                        aria-label="上一張人物卡"
                    >
                        ←
                    </button>
                    <div
                        className="geisha-coverflow__viewport"
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerRelease}
                        onPointerCancel={onPointerRelease}
                        onPointerLeave={onPointerRelease}
                    >
                        <div className="geisha-coverflow__track">
                            {orderedGeishas.map((geisha, index) => {
                                const offset = getCoverflowOffset(index);
                                const distanceFromActive = Math.abs(offset);

                                return (
                                    <div
                                        key={geisha.id}
                                        className={`geisha-coverflow__slide ${index === activeGeishaIndex ? 'is-active' : ''} ${distanceFromActive === 1 ? 'is-adjacent' : ''} ${distanceFromActive > 2 ? 'is-distant' : ''}`}
                                        aria-current={index === activeGeishaIndex}
                                        style={{
                                            ['--coverflow-offset' as string]: `${offset}`,
                                            ['--coverflow-abs-offset' as string]: `${distanceFromActive}`
                                        }}
                                    >
                                        <GeishaCard
                                            geisha={geisha}
                                            myCount={myCountMap.get(geisha.id) ?? 0}
                                            opponentCount={opponentCountMap.get(geisha.id) ?? 0}
                                            currentPlayerId={playerId}
                                            isFocused={index === activeGeishaIndex}
                                            itemIcon={geishaItemIconMap.get(geisha.id) ?? null}
                                            motionCues={boardMotionCues.filter((cue) => cue.targetGeishaId === geisha.id)}
                                            prefersReducedMotion={prefersReducedMotion}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="geisha-coverflow__nav geisha-coverflow__nav--next"
                        onClick={() => onCoverflowStep('next')}
                        aria-label="下一張人物卡"
                    >
                        →
                    </button>
                </div>
            </section>
        )}
    </section>
);
