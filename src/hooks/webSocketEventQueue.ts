export const appendRuntimeEvent = <TEvent>(queue: TEvent[], event: TEvent | null): TEvent[] => {
    if (!event) {
        return queue;
    }

    return [...queue, event];
};

export const consumeRuntimeEvent = <TEvent>(queue: TEvent[]): TEvent[] => {
    if (queue.length === 0) {
        return queue;
    }

    return queue.slice(1);
};

export const clearRuntimeQueueOnCleanup = <TEvent>(queue: TEvent[]): TEvent[] => (
    queue.length === 0 ? queue : []
);
