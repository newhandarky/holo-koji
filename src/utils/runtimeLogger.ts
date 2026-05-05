import config from '../config/environment';

type SafePrimitive = string | number | boolean | null;
type RuntimeLogContext = Record<string, SafePrimitive | undefined>;

const sanitizeContext = (context?: RuntimeLogContext) => {
    if (!context) {
        return undefined;
    }

    const entries = Object.entries(context).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
        return undefined;
    }

    return Object.fromEntries(entries);
};

const emit = (
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: RuntimeLogContext
) => {
    const safeContext = sanitizeContext(context);

    if (safeContext) {
        console[level](message, safeContext);
        return;
    }

    console[level](message);
};

export const isFrontendDiagnosticsEnabled = () => (
    config.isDevelopment && config.diagnosticsEnabled
);

export const frontendLogger = {
    info(message: string, context?: RuntimeLogContext) {
        emit('info', message, context);
    },
    warn(message: string, context?: RuntimeLogContext) {
        emit('warn', message, context);
    },
    error(message: string, context?: RuntimeLogContext) {
        emit('error', message, context);
    },
    diagnostic(message: string, context?: RuntimeLogContext) {
        if (!isFrontendDiagnosticsEnabled()) {
            return;
        }

        emit('debug', message, context);
    }
};

export const summarizeSocketMessage = (message: { type?: string; payload?: any } | null | undefined) => {
    if (!message) {
        return null;
    }

    const payload = message.payload;
    const payloadType = payload?.action?.type ?? payload?.type ?? null;

    return sanitizeContext({
        type: typeof message.type === 'string' ? message.type : 'unknown',
        roomId: typeof payload?.roomId === 'string' ? payload.roomId : undefined,
        gameId: typeof payload?.gameId === 'string' ? payload.gameId : undefined,
        playerId: typeof payload?.playerId === 'string' ? payload.playerId : undefined,
        mode: payload?.mode === 'npc' || payload?.mode === 'online' ? payload.mode : undefined,
        geishaSet: typeof payload?.geishaSet === 'string' ? payload.geishaSet : undefined,
        setupMode: payload?.setupMode === 'random' || payload?.setupMode === 'custom' ? payload.setupMode : undefined,
        actionType: typeof payloadType === 'string' ? payloadType : undefined,
        hasPayload: Boolean(payload)
    });
};

export const summarizeGameState = (state: any) => {
    if (!state) {
        return null;
    }

    return sanitizeContext({
        gameId: typeof state.gameId === 'string' ? state.gameId : undefined,
        geishaSet: typeof state.geishaSet === 'string' ? state.geishaSet : undefined,
        setupMode: state.setupMode === 'random' || state.setupMode === 'custom' ? state.setupMode : undefined,
        phase: typeof state.phase === 'string' ? state.phase : undefined,
        round: typeof state.round === 'number' ? state.round : undefined,
        playerCount: Array.isArray(state.players) ? state.players.length : undefined,
        hasPendingInteraction: Boolean(state.pendingInteraction)
    });
};
