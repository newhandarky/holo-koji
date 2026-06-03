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

    receive(type: string, payload: unknown) {
        this.onmessage?.({
            data: JSON.stringify({ type, payload })
        } as MessageEvent);
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

    test('dispatches the same event to every registered listener', async () => {
        const socket = new GameWebSocket();
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();

        socket.on('ERROR', firstHandler);
        socket.on('ERROR', secondHandler);

        const connectPromise = socket.connect('ws://localhost:3001');
        MockWebSocket.instances[0].open();
        await connectPromise;

        MockWebSocket.instances[0].receive('ERROR', { message: '伺服器錯誤' });

        expect(firstHandler).toHaveBeenCalledWith({ message: '伺服器錯誤' });
        expect(secondHandler).toHaveBeenCalledWith({ message: '伺服器錯誤' });
    });

    test('off with a handler removes only that listener', async () => {
        const socket = new GameWebSocket();
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();

        socket.on('ERROR', firstHandler);
        socket.on('ERROR', secondHandler);
        socket.off('ERROR', firstHandler);

        const connectPromise = socket.connect('ws://localhost:3001');
        MockWebSocket.instances[0].open();
        await connectPromise;

        MockWebSocket.instances[0].receive('ERROR', { message: '伺服器錯誤' });

        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).toHaveBeenCalledWith({ message: '伺服器錯誤' });
    });

    test('off without a handler clears the whole event', async () => {
        const socket = new GameWebSocket();
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        socket.on('ERROR', firstHandler);
        socket.on('ERROR', secondHandler);
        socket.off('ERROR');

        const connectPromise = socket.connect('ws://localhost:3001');
        MockWebSocket.instances[0].open();
        await connectPromise;

        MockWebSocket.instances[0].receive('ERROR', { message: '伺服器錯誤' });

        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    test('a throwing listener does not block the remaining listeners', async () => {
        const socket = new GameWebSocket();
        const throwingHandler = jest.fn(() => {
            throw new Error('listener failed');
        });
        const secondHandler = jest.fn();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        socket.on('ERROR', throwingHandler);
        socket.on('ERROR', secondHandler);

        const connectPromise = socket.connect('ws://localhost:3001');
        MockWebSocket.instances[0].open();
        await connectPromise;

        MockWebSocket.instances[0].receive('ERROR', { message: '伺服器錯誤' });

        expect(throwingHandler).toHaveBeenCalledWith({ message: '伺服器錯誤' });
        expect(secondHandler).toHaveBeenCalledWith({ message: '伺服器錯誤' });
        expect(errorSpy).toHaveBeenCalled();

        errorSpy.mockRestore();
    });
});
