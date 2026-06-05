import React from 'react';

interface PlayerHandControlsProps {
    cardsLength: number;
    focusedIndex: number;
    onMoveFocus: (direction: 'prev' | 'next') => void;
}

export const PlayerHandControls: React.FC<PlayerHandControlsProps> = ({
    cardsLength,
    focusedIndex,
    onMoveFocus
}) => (
    <div className="player-hand-controls">
        <button
            type="button"
            className="player-hand-controls__button"
            onClick={() => onMoveFocus('prev')}
            disabled={cardsLength < 2}
            aria-label="上一張手牌"
        >
            ←
        </button>
        <span className="player-hand-controls__status" aria-live="polite">
            {cardsLength === 0 ? '0 / 0' : `${Math.max(focusedIndex, 0) + 1} / ${cardsLength}`}
        </span>
        <button
            type="button"
            className="player-hand-controls__button"
            onClick={() => onMoveFocus('next')}
            disabled={cardsLength < 2}
            aria-label="下一張手牌"
        >
            →
        </button>
    </div>
);
