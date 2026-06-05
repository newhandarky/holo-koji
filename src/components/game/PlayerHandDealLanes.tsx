import React, { useMemo } from 'react';
import { GeishaSet } from '@newhandarky/hanakoji-game-types';
import { getItemCardImage } from '../../utils/gameData';
import { OpeningDealCueStep } from './gameMotion';
import { splitOpeningDealSteps } from './playerHandModel';

interface PlayerHandDealLanesProps {
    openingDealSteps: OpeningDealCueStep[];
    geishaSet: GeishaSet;
}

export const PlayerHandDealLanes: React.FC<PlayerHandDealLanesProps> = ({
    openingDealSteps,
    geishaSet
}) => {
    const { selfDealSteps, opponentDealSteps } = useMemo(
        () => splitOpeningDealSteps(openingDealSteps),
        [openingDealSteps]
    );

    if (openingDealSteps.length === 0) {
        return null;
    }

    const renderDealStep = (step: OpeningDealCueStep, lane: 'self' | 'opponent') => {
        const cardImage = step.isMasked ? '' : getItemCardImage(step.card, geishaSet);

        return (
            <div
                key={step.id}
                className={`player-hand-deal-card player-hand-deal-card--${lane} ${step.reducedMotion ? 'player-hand-deal-card--reduced' : ''} ${step.isMasked ? 'is-masked' : ''}`}
                style={{
                    ['--deal-slot-index' as string]: `${step.slotIndex}`,
                    ['--deal-slot-count' as string]: `${step.slotCount}`,
                    ['--motion-delay' as string]: `${step.delayMs}ms`,
                    ['--motion-duration' as string]: `${step.durationMs}ms`,
                    backgroundImage: cardImage ? `url(${cardImage})` : 'none'
                }}
            />
        );
    };

    return (
        <div className="player-hand-deal-lanes" aria-hidden="true">
            <div className="player-hand-deal-lane player-hand-deal-lane--opponent">
                {opponentDealSteps.map((step) => renderDealStep(step, 'opponent'))}
            </div>
            <div className="player-hand-deal-lane player-hand-deal-lane--self">
                {selfDealSteps.map((step) => renderDealStep(step, 'self'))}
            </div>
        </div>
    );
};
