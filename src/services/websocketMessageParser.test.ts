import { parseWebSocketMessage } from './websocketMessageParser';

describe('websocketMessageParser', () => {
    test('parses valid websocket messages', () => {
        expect(parseWebSocketMessage(JSON.stringify({
            type: 'ERROR',
            payload: { message: '錯誤' }
        }))).toEqual({
            type: 'ERROR',
            payload: { message: '錯誤' }
        });
    });

    test('rejects invalid json and messages without a type', () => {
        expect(() => parseWebSocketMessage('{invalid')).toThrow();
        expect(() => parseWebSocketMessage(JSON.stringify({ payload: {} }))).toThrow('Invalid WebSocket message type');
    });
});
