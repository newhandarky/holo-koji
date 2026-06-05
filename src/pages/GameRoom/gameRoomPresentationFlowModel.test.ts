import { isGameRoomPresentationFlowActive } from './gameRoomPresentationFlowModel';

const baseFlowInput = {
    isOrderDecisionOpen: false,
    readyStatus: null,
    isOpeningDealActive: false,
    isOpeningHandRevealBlocking: false,
    roundSummary: null
};

describe('gameRoomPresentationFlowModel', () => {
    test('does not block draw presentation during normal active play', () => {
        expect(isGameRoomPresentationFlowActive(baseFlowInput)).toBe(false);
    });

    test.each([
        ['order decision', { isOrderDecisionOpen: true }],
        ['ready sheet', { readyStatus: { confirmations: [], waitingFor: ['p1'] } }],
        ['opening deal', { isOpeningDealActive: true }],
        ['opening hand reveal', { isOpeningHandRevealBlocking: true }],
        ['round summary', { roundSummary: { round: 1, players: [] } }]
    ])('blocks draw presentation during %s flow', (_label, override) => {
        expect(isGameRoomPresentationFlowActive({
            ...baseFlowInput,
            ...override
        })).toBe(true);
    });
});
