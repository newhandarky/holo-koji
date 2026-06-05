import {
    classifyDrawEvent,
    DRAW_FLIP_NORMAL_MS,
    DRAW_FLIP_REDUCED_MS,
    DRAW_NOTIFICATION_TIMEOUT_MS,
    getDrawFlipDurationMs,
    getDrawNotificationTimeoutMs,
    routeDrawPresentation,
    transitionDrawDecision
} from './drawNotificationModel';

describe('drawNotificationModel', () => {
    const selfDraw = {
        playerId: 'p1',
        card: { id: 'self-card-1', geishaId: 2, type: 'item' }
    };

    test('classifies self draw with a local card reference', () => {
        const event = classifyDrawEvent(selfDraw, 'p1');

        expect(event.owner).toBe('self');
        expect(event.cardReference?.id).toBe('self-card-1');
    });

    test('classifies opponent draw without a card reference', () => {
        const event = classifyDrawEvent({
            playerId: 'p2',
            card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' }
        }, 'p1');

        expect(event.owner).toBe('opponent');
        expect(event.cardReference).toBeUndefined();
    });

    test('routes self draw by current focus and necessary flow gate', () => {
        const event = classifyDrawEvent(selfDraw, 'p1');

        expect(routeDrawPresentation(event, 'characterBoard', false)).toBe('notify');
        expect(routeDrawPresentation(event, 'info', false)).toBe('notify');
        expect(routeDrawPresentation(event, 'handActions', false)).toBe('animate');
        expect(routeDrawPresentation(event, 'handActions', true)).toBe('defer');
    });

    test('keeps opponent draw on safe summary route', () => {
        const event = classifyDrawEvent({
            playerId: 'p2',
            card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' }
        }, 'p1');

        expect(routeDrawPresentation(event, 'handActions', false)).toBe('opponent');
    });

    test('defers opponent draw while a necessary presentation flow is active', () => {
        const event = classifyDrawEvent({
            playerId: 'p2',
            card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' }
        }, 'p1');

        expect(routeDrawPresentation(event, 'characterBoard', true)).toBe('defer');
    });

    test('uses fixed notification timeout and bounded flip durations', () => {
        expect(getDrawNotificationTimeoutMs()).toBe(DRAW_NOTIFICATION_TIMEOUT_MS);
        expect(getDrawFlipDurationMs(false)).toBeLessThanOrEqual(2000);
        expect(getDrawFlipDurationMs(true)).toBeLessThanOrEqual(1000);
        expect(DRAW_FLIP_REDUCED_MS).toBeLessThan(DRAW_FLIP_NORMAL_MS);
    });

    test('terminal decisions do not replay into another state', () => {
        expect(transitionDrawDecision('pending', 'view_now')).toBe('view_now');
        expect(transitionDrawDecision('dismissed', 'view_now')).toBe('dismissed');
        expect(transitionDrawDecision('timeout_dismissed', 'view_now')).toBe('timeout_dismissed');
        expect(transitionDrawDecision('animated', 'dismissed')).toBe('animated');
    });
});
