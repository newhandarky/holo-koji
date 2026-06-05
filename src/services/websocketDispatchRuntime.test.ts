import {
    addWebSocketMessageHandler,
    dispatchWebSocketMessage,
    removeWebSocketMessageHandler,
    type MessageHandler
} from './websocketDispatchRuntime';

describe('websocketDispatchRuntime', () => {
    test('dispatches all handlers and isolates individual handler failures', () => {
        const handlers = new Map<string, Set<MessageHandler>>();
        const firstHandler = jest.fn(() => {
            throw new Error('listener failed');
        });
        const secondHandler = jest.fn();
        const onHandlerError = jest.fn();

        addWebSocketMessageHandler(handlers, 'ERROR', firstHandler);
        addWebSocketMessageHandler(handlers, 'ERROR', secondHandler);

        expect(dispatchWebSocketMessage({
            handlers,
            messageType: 'ERROR',
            payload: { message: '錯誤' },
            onHandlerError
        })).toBe(true);

        expect(firstHandler).toHaveBeenCalledWith({ message: '錯誤' });
        expect(secondHandler).toHaveBeenCalledWith({ message: '錯誤' });
        expect(onHandlerError).toHaveBeenCalledWith('ERROR', expect.any(Error));
    });

    test('removes a specific handler or clears the whole event channel', () => {
        const handlers = new Map<string, Set<MessageHandler>>();
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();

        addWebSocketMessageHandler(handlers, 'ERROR', firstHandler);
        addWebSocketMessageHandler(handlers, 'ERROR', secondHandler);
        removeWebSocketMessageHandler(handlers, 'ERROR', firstHandler);

        expect(handlers.get('ERROR')).toEqual(new Set([secondHandler]));

        removeWebSocketMessageHandler(handlers, 'ERROR');
        expect(handlers.has('ERROR')).toBe(false);
    });
});
