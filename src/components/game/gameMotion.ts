import { useEffect, useState } from 'react';
import { getDrawFlipDurationMs } from './drawNotificationModel';
import { prepareMotionQueue, type MotionCue } from './gameMotionModel';

export {
    prepareMotionQueue,
    resolveMotionSourceZone,
    type MotionCue,
    type MotionCueKind,
    type MotionOwner,
    type MotionSourceZone
} from './gameMotionModel';
export {
    buildMotionSnapshot,
    deriveMotionCues,
    type MotionSnapshot
} from './gameMotionSnapshot';
export {
    createOpeningDealCueSteps,
    getOpeningDealCueDuration,
    type DealAnimationStep,
    type DealCueOwner,
    type OpeningDealCueStep
} from './openingDealCueModel';

export const createDrawMotionCue = (
    cardId: string,
    prefersReducedMotion: boolean
): MotionCue => prepareMotionQueue([{
    id: `draw:self:${cardId}:${Date.now()}`,
    kind: 'draw',
    owner: 'self',
    cardId,
    sourceZone: 'hand',
    targetZone: 'hand',
    createdAt: Date.now(),
    durationMs: getDrawFlipDurationMs(prefersReducedMotion),
    delayMs: 0,
    reducedMotion: prefersReducedMotion
}])[0];

export const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(mediaQuery.matches);

        update();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', update);
            return () => mediaQuery.removeEventListener('change', update);
        }

        mediaQuery.addListener(update);
        return () => mediaQuery.removeListener(update);
    }, []);

    return prefersReducedMotion;
};
