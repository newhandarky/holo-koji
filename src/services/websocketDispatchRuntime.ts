export type MessageHandler = (payload: unknown) => void;

export interface DispatchWebSocketMessageOptions {
    handlers: Map<string, Set<MessageHandler>>;
    messageType: string;
    payload: unknown;
    onHandlerError: (messageType: string, error: unknown) => void;
}

export const dispatchWebSocketMessage = ({
    handlers,
    messageType,
    payload,
    onHandlerError
}: DispatchWebSocketMessageOptions): boolean => {
    const messageHandlers = handlers.get(messageType);
    if (!messageHandlers || messageHandlers.size === 0) {
        return false;
    }

    Array.from(messageHandlers).forEach((handler) => {
        try {
            handler(payload);
        } catch (error) {
            onHandlerError(messageType, error);
        }
    });

    return true;
};

export const addWebSocketMessageHandler = (
    handlers: Map<string, Set<MessageHandler>>,
    messageType: string,
    handler: MessageHandler
): void => {
    const currentHandlers = handlers.get(messageType) ?? new Set<MessageHandler>();
    currentHandlers.add(handler);
    handlers.set(messageType, currentHandlers);
};

export const removeWebSocketMessageHandler = (
    handlers: Map<string, Set<MessageHandler>>,
    messageType: string,
    handler?: MessageHandler
): void => {
    if (!handler) {
        handlers.delete(messageType);
        return;
    }

    const currentHandlers = handlers.get(messageType);
    if (!currentHandlers) {
        return;
    }

    currentHandlers.delete(handler);
    if (currentHandlers.size === 0) {
        handlers.delete(messageType);
    }
};
