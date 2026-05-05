import { GameWebSocket } from './websocket';

class MockWebSocket {
    static instances: MockWebSocket[] = [];
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    readyState = MockWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onerror: ((error: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;

    constructor(public url: string) {
        MockWebSocket.instances.push(this);
    }

    send = jest.fn();
    close = jest.fn(() => {
        this.readyState = MockWebSocket.CLOSED;
    });

    open() {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.();
    }
}

describe('GameWebSocket', () => {
    const originalWebSocket = global.WebSocket;

    beforeEach(() => {
        MockWebSocket.instances = [];
        Object.defineProperty(global, 'WebSocket', {
            configurable: true,
            writable: true,
            value: MockWebSocket
        });
    });

    afterEach(() => {
        Object.defineProperty(global, 'WebSocket', {
            configurable: true,
            writable: true,
            value: originalWebSocket
        });
    });

    test('reuses the same pending connection while websocket is still connecting', async () => {
        const socket = new GameWebSocket();

        const firstConnect = socket.connect('ws://localhost:3001');
        const secondConnect = socket.connect('ws://localhost:3001');

        expect(MockWebSocket.instances).toHaveLength(1);
        expect(firstConnect).toBe(secondConnect);

        MockWebSocket.instances[0].open();

        await expect(firstConnect).resolves.toBeUndefined();
        await expect(secondConnect).resolves.toBeUndefined();
        expect(MockWebSocket.instances).toHaveLength(1);
    });
});
