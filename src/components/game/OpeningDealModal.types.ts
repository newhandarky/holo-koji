import type { OpeningDealSummary } from '@newhandarky/hanakoji-game-types';
import type { CardBackTheme } from './cardBackTheme';

export type OpeningDealModalStepType = OpeningDealSummary['steps'][number]['type'];
export type OpeningDealViewerRole = 'self' | 'opponent' | 'neutral';
export type OpeningDealTurnRole = 'first' | 'second' | 'neutral';

export interface OpeningDealModalStep {
    id: string;
    type: OpeningDealModalStepType;
    order: number;
    targetZone?: 'hidden-reserve';
    targetPlayerId?: string;
    targetPlayerName?: string;
    cardIndex?: number;
    viewerRole: OpeningDealViewerRole;
    turnRole: OpeningDealTurnRole;
    delayMs: number;
    durationMs: number;
}

export interface OpeningDealModalModel {
    sequenceId: string;
    replayable: boolean;
    reducedMotion: boolean;
    steps: OpeningDealModalStep[];
    cardBackTheme: CardBackTheme;
    totalMs: number;
}
