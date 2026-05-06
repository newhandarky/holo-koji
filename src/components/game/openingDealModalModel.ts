import type { OpeningDealSummary, Player } from 'game-shared-types';
import { getCardBackTheme } from './cardBackTheme';
import type {
    OpeningDealModalModel,
    OpeningDealModalStep,
    OpeningDealTurnRole,
    OpeningDealViewerRole
} from './OpeningDealModal.types';

const STEP_DELAY_MS = {
    normal: 360,
    reduced: 70
};

const STEP_DURATION_MS = {
    normal: 260,
    reduced: 70
};

const AUTO_CLOSE_BUFFER_MS = {
    normal: 520,
    reduced: 180
};

const getPlayerName = (players: Player[], playerId?: string) =>
    players.find((player) => player.id === playerId)?.name || '玩家';

const getViewerRole = (targetPlayerId: string | undefined, viewerId: string): OpeningDealViewerRole => {
    if (!targetPlayerId) {
        return 'neutral';
    }

    return targetPlayerId === viewerId ? 'self' : 'opponent';
};

const getTurnRoleMap = (steps: OpeningDealSummary['steps']): Map<string, OpeningDealTurnRole> => {
    const dealSteps = steps
        .filter((step): step is Extract<OpeningDealSummary['steps'][number], { type: 'DEAL_CARD_BACK' }> => step.type === 'DEAL_CARD_BACK')
        .sort((left, right) => left.order - right.order);
    const turnRoleMap = new Map<string, OpeningDealTurnRole>();

    dealSteps.forEach((step) => {
        if (!turnRoleMap.has(step.targetPlayerId)) {
            turnRoleMap.set(step.targetPlayerId, turnRoleMap.size === 0 ? 'first' : 'second');
        }
    });

    return turnRoleMap;
};

export const buildOpeningDealModalModel = (
    openingDeal: OpeningDealSummary,
    players: Player[],
    viewerId: string,
    reducedMotion: boolean
): OpeningDealModalModel => {
    const stepDelayMs = reducedMotion ? STEP_DELAY_MS.reduced : STEP_DELAY_MS.normal;
    const stepDurationMs = reducedMotion ? STEP_DURATION_MS.reduced : STEP_DURATION_MS.normal;
    const orderedSteps = [...openingDeal.steps].sort((left, right) => left.order - right.order);
    const turnRoleMap = getTurnRoleMap(orderedSteps);

    const steps: OpeningDealModalStep[] = orderedSteps.map((step, index) => {
        const base = {
            id: `opening-deal-step-${step.order}-${step.type}-${index}`,
            type: step.type,
            order: step.order,
            delayMs: index * stepDelayMs,
            durationMs: stepDurationMs
        };

        if (step.type === 'BURN_HIDDEN_CARD') {
            return {
                ...base,
                targetZone: step.targetZone,
                viewerRole: 'neutral',
                turnRole: 'neutral'
            };
        }

        if (step.type === 'DEAL_CARD_BACK') {
            return {
                ...base,
                targetPlayerId: step.targetPlayerId,
                targetPlayerName: getPlayerName(players, step.targetPlayerId),
                cardIndex: step.cardIndex,
                viewerRole: getViewerRole(step.targetPlayerId, viewerId),
                turnRole: turnRoleMap.get(step.targetPlayerId) ?? 'neutral'
            };
        }

        return {
            ...base,
            viewerRole: 'neutral',
            turnRole: 'neutral'
        };
    });

    const totalMs = getOpeningDealModalTotalMs({ steps, reducedMotion });

    return {
        sequenceId: openingDeal.sequenceId,
        replayable: openingDeal.replayable,
        reducedMotion,
        steps,
        cardBackTheme: getCardBackTheme(),
        totalMs
    };
};

export const getOpeningDealModalTotalMs = (model: Pick<OpeningDealModalModel, 'steps' | 'reducedMotion'>): number => {
    const maxStepEnd = model.steps.reduce(
        (maxDuration, step) => Math.max(maxDuration, step.delayMs + step.durationMs),
        0
    );
    return maxStepEnd + (model.reducedMotion ? AUTO_CLOSE_BUFFER_MS.reduced : AUTO_CLOSE_BUFFER_MS.normal);
};
