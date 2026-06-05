import type { DrawQueueEvent } from '../../components/game/drawNotificationModel';
import {
    getActiveDrawEventId,
    isActiveSelfDrawNotificationEvent,
    resolveDrawPresentationRoute,
    shouldHoldFocusForSelfDrawEvent,
    shouldResetDrawPresentationState
} from './gameRoomDrawPresentationModel';

const makeDrawEvent = (
    playerId: string,
    cardType: DrawQueueEvent['card']['type'] = 'item'
): DrawQueueEvent => ({
    playerId,
    card: {
        id: `${playerId}-${cardType}-card`,
        geishaId: 1,
        type: cardType
    }
});

describe('gameRoomDrawPresentationModel', () => {
    test('derives active draw event id from player and card reference', () => {
        expect(getActiveDrawEventId(makeDrawEvent('p1'))).toBe('p1:item:p1-item-card');
        expect(getActiveDrawEventId(null)).toBeNull();
    });

    test('identifies active visible self draw notifications only', () => {
        const activeDrawQueueEvent = makeDrawEvent('p1');
        const activeDrawEventId = getActiveDrawEventId(activeDrawQueueEvent);

        expect(isActiveSelfDrawNotificationEvent({
            activeDrawEventId,
            activeDrawQueueEvent,
            activeDrawNotificationEventId: activeDrawEventId,
            completedDrawEventIds: new Set(),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard'
        })).toBe(true);

        expect(isActiveSelfDrawNotificationEvent({
            activeDrawEventId,
            activeDrawQueueEvent: makeDrawEvent('p1', 'hidden'),
            activeDrawNotificationEventId: activeDrawEventId,
            completedDrawEventIds: new Set(),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard'
        })).toBe(false);
    });

    test('holds focus for pending visible self draw outside hand actions', () => {
        const activeDrawQueueEvent = makeDrawEvent('p1');
        const activeDrawEventId = getActiveDrawEventId(activeDrawQueueEvent);

        expect(shouldHoldFocusForSelfDrawEvent({
            activeDrawEventId,
            activeDrawQueueEvent,
            activeDrawNotificationEventId: null,
            completedDrawEventIds: new Set(),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard'
        })).toBe(true);

        expect(shouldHoldFocusForSelfDrawEvent({
            activeDrawEventId,
            activeDrawQueueEvent,
            activeDrawNotificationEventId: null,
            completedDrawEventIds: new Set([activeDrawEventId ?? '']),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard'
        })).toBe(false);

        expect(shouldHoldFocusForSelfDrawEvent({
            activeDrawEventId,
            activeDrawQueueEvent,
            activeDrawNotificationEventId: null,
            completedDrawEventIds: new Set(),
            currentPlayerId: 'p1',
            focusSection: 'handActions'
        })).toBe(false);
    });

    test('routes draw presentation through necessary flow and interaction gates', () => {
        expect(resolveDrawPresentationRoute({
            activeDrawQueueEvent: makeDrawEvent('p1'),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            isInteractionLocked: false,
            isPresentationFlowActive: true
        }).route).toBe('defer');

        expect(resolveDrawPresentationRoute({
            activeDrawQueueEvent: makeDrawEvent('p1'),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            isInteractionLocked: true,
            isPresentationFlowActive: false
        }).route).toBe('defer');

        expect(resolveDrawPresentationRoute({
            activeDrawQueueEvent: makeDrawEvent('p2', 'hidden'),
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            isInteractionLocked: true,
            isPresentationFlowActive: false
        }).route).toBe('opponent');
    });

    test('resets draw presentation state only when queue event or id is missing', () => {
        const activeDrawQueueEvent = makeDrawEvent('p1');
        expect(shouldResetDrawPresentationState(null, null)).toBe(true);
        expect(shouldResetDrawPresentationState(activeDrawQueueEvent, null)).toBe(true);
        expect(shouldResetDrawPresentationState(activeDrawQueueEvent, 'p1:item:p1-item-card')).toBe(false);
    });
});
