import config from '../config/environment';

type SafePrimitive = string | number | boolean | null;
type RuntimeLogContext = Record<string, SafePrimitive | undefined>;
type SafeRecord = Record<string, unknown>;

type UnknownSocketMessage = {
    type?: unknown;
    payload?: unknown;
} | null | undefined;

type UnknownGameStateSummaryInput = {
    gameId?: unknown;
    geishaSet?: unknown;
    setupMode?: unknown;
    phase?: unknown;
    round?: unknown;
    players?: unknown;
    accountPersistenceStatus?: unknown;
    pendingInteraction?: unknown;
} | null | undefined;

const isRecord = (value: unknown): value is SafeRecord => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getRecord = (record: SafeRecord, key: string) => {
    const value = record[key];
    return isRecord(value) ? value : undefined;
};

const getString = (record: SafeRecord, key: string) => {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
};

const getNumber = (record: SafeRecord, key: string) => {
    const value = record[key];
    return typeof value === 'number' ? value : undefined;
};

const getPersistenceMode = (record: SafeRecord | undefined) => {
    const mode = record?.mode;
    return mode === 'durable' || mode === 'temporary' ? mode : undefined;
};

const getAchievementStatus = (record: SafeRecord | undefined) => {
    const status = record?.status;
    return status === 'available' || status === 'guest' || status === 'unavailable'
        ? status
        : undefined;
};

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

export const summarizeSocketMessage = (message: UnknownSocketMessage) => {
    if (!message) {
        return null;
    }

    const payload = isRecord(message.payload) ? message.payload : undefined;
    const action = payload ? getRecord(payload, 'action') : undefined;
    const payloadType = action ? getString(action, 'type') : payload ? getString(payload, 'type') : undefined;
    const persistenceStatus = payload ? getRecord(payload, 'persistenceStatus') : undefined;

    return sanitizeContext({
        type: typeof message.type === 'string' ? message.type : 'unknown',
        roomId: payload ? getString(payload, 'roomId') : undefined,
        gameId: payload ? getString(payload, 'gameId') : undefined,
        playerId: payload ? getString(payload, 'playerId') : undefined,
        accountStatus: message.type === 'ACCOUNT_SYNC_RESULT' && payload ? getString(payload, 'status') : undefined,
        accountPersistenceMode: getPersistenceMode(persistenceStatus),
        achievementStatus: getAchievementStatus(payload),
        achievementNewUnlockCount: payload ? getNumber(payload, 'newUnlockCount') : undefined,
        mode: payload?.mode === 'npc' || payload?.mode === 'online' ? payload.mode : undefined,
        geishaSet: payload ? getString(payload, 'geishaSet') : undefined,
        setupMode: payload?.setupMode === 'random' || payload?.setupMode === 'custom' ? payload.setupMode : undefined,
        actionType: typeof payloadType === 'string' ? payloadType : undefined,
        hasPayload: Boolean(payload)
    });
};

export const summarizeGameState = (state: UnknownGameStateSummaryInput) => {
    if (!state) {
        return null;
    }

    const accountPersistenceStatus = isRecord(state.accountPersistenceStatus)
        ? state.accountPersistenceStatus
        : undefined;

    return sanitizeContext({
        gameId: typeof state.gameId === 'string' ? state.gameId : undefined,
        geishaSet: typeof state.geishaSet === 'string' ? state.geishaSet : undefined,
        setupMode: state.setupMode === 'random' || state.setupMode === 'custom' ? state.setupMode : undefined,
        phase: typeof state.phase === 'string' ? state.phase : undefined,
        round: typeof state.round === 'number' ? state.round : undefined,
        playerCount: Array.isArray(state.players) ? state.players.length : undefined,
        accountPersistenceMode: getPersistenceMode(accountPersistenceStatus),
        hasPendingInteraction: Boolean(state.pendingInteraction)
    });
};
