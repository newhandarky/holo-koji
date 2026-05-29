import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import type { OpeningDealSummary, Player } from '@newhandarky/hanakoji-game-types';
import OpeningDealModal from './OpeningDealModal';
import { buildOpeningDealModalModel } from './openingDealModalModel';

const players: Player[] = [
    {
        id: 'p1',
        name: '玩家一',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    },
    {
        id: 'p2',
        name: '玩家二',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    }
];

const openingDeal: OpeningDealSummary = {
    sequenceId: 'opening-room-1-round-1',
    status: 'completed',
    completed: true,
    replayable: true,
    steps: [
        { type: 'BURN_HIDDEN_CARD', order: 0, targetZone: 'hidden-reserve' },
        { type: 'DEAL_CARD_BACK', order: 1, targetPlayerId: 'p1', cardIndex: 1 },
        { type: 'DEAL_CARD_BACK', order: 2, targetPlayerId: 'p2', cardIndex: 1 },
        { type: 'OPENING_DEAL_COMPLETE', order: 3 }
    ]
};

describe('OpeningDealModal', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    test('renders deck, reserve, and dealt cards with the default card back theme', () => {
        const model = buildOpeningDealModalModel(openingDeal, players, 'p1', false);

        render(<OpeningDealModal isOpen model={model} onComplete={jest.fn()} />);

        const cardBacks = screen.getAllByTestId('opening-deal-card-back');
        expect(cardBacks.length).toBeGreaterThanOrEqual(4);
        cardBacks.forEach((cardBack) => {
            expect(cardBack).toHaveAttribute('data-card-back-theme', 'default-ginza');
        });
    });

    test('does not render forbidden card identity fields', () => {
        const model = buildOpeningDealModalModel(openingDeal, players, 'p1', false);

        render(<OpeningDealModal isOpen model={model} onComplete={jest.fn()} />);

        const text = document.body.textContent ?? '';
        expect(text).not.toContain('opening-room-1-round-1');
        expect(text).not.toContain('geishaId');
        expect(text).not.toContain('itemLabel');
        expect(text).not.toContain('itemImageUrl');
    });

    test('shows completion state before auto-closing', () => {
        const model = buildOpeningDealModalModel(openingDeal, players, 'p1', false);
        const onComplete = jest.fn();

        render(<OpeningDealModal isOpen model={model} onComplete={onComplete} />);

        expect(screen.queryByText('發牌完成')).not.toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(model.steps.find((step) => step.type === 'OPENING_DEAL_COMPLETE')?.delayMs ?? 0);
        });

        expect(screen.getAllByText('發牌完成').length).toBeGreaterThan(0);
        expect(onComplete).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(model.totalMs);
        });

        expect(onComplete).toHaveBeenCalled();
    });

    test('labels reversed deal order as first and second player directions', () => {
        const reversedOpeningDeal: OpeningDealSummary = {
            ...openingDeal,
            steps: [
                { type: 'BURN_HIDDEN_CARD', order: 0, targetZone: 'hidden-reserve' },
                { type: 'DEAL_CARD_BACK', order: 1, targetPlayerId: 'p2', cardIndex: 1 },
                { type: 'DEAL_CARD_BACK', order: 2, targetPlayerId: 'p1', cardIndex: 1 },
                { type: 'OPENING_DEAL_COMPLETE', order: 3 }
            ]
        };
        const model = buildOpeningDealModalModel(reversedOpeningDeal, players, 'p1', false);

        render(<OpeningDealModal isOpen model={model} onComplete={jest.fn()} />);

        expect(screen.getByText('先手方向 玩家二（對手）')).toBeInTheDocument();
        expect(screen.getByText('後手方向 玩家一（你）')).toBeInTheDocument();
        expect(screen.getByText('先手 1')).toBeInTheDocument();
        expect(screen.getByText('後手 1')).toBeInTheDocument();
    });
});
