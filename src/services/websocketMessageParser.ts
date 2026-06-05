export interface ParsedWebSocketMessage {
    type: string;
    payload: unknown;
}

export const parseWebSocketMessage = (rawData: string): ParsedWebSocketMessage => {
    const parsed = JSON.parse(rawData) as unknown;

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid WebSocket message');
    }

    const candidate = parsed as { type?: unknown; payload?: unknown };
    if (typeof candidate.type !== 'string') {
        throw new Error('Invalid WebSocket message type');
    }

    return {
        type: candidate.type,
        payload: candidate.payload
    };
};
