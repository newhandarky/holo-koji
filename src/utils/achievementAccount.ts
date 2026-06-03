import { AchievementAcknowledgeRequest, AchievementStatusResult } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';

const ACHIEVEMENT_TIMEOUT_MS = 3000;

const unavailableResult: AchievementStatusResult = {
    status: 'unavailable',
    message: '成就暫時不可用，進度目前無法保存。',
    persistenceStatus: {
        mode: 'temporary',
        available: false,
        message: 'Achievement status request timed out.'
    }
};

let achievementResponseQueue: Promise<unknown> | null = null;

const waitForAchievementResult = () => new Promise<AchievementStatusResult>((resolve) => {
    let settled = false;
    let unsubscribe: () => void = () => undefined;
    const cleanup = (timeoutId: ReturnType<typeof setTimeout>) => {
        clearTimeout(timeoutId);
        unsubscribe();
    };
    const timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup(timeoutId);
        resolve(unavailableResult);
    }, ACHIEVEMENT_TIMEOUT_MS);

    const handleAchievementResult = (payload: AchievementStatusResult) => {
        if (settled) return;
        settled = true;
        cleanup(timeoutId);
        resolve(payload);
    };
    const maybeUnsubscribe = gameWebSocket.on('ACHIEVEMENT_STATUS_RESULT', handleAchievementResult);
    unsubscribe = typeof maybeUnsubscribe === 'function'
        ? maybeUnsubscribe
        : () => gameWebSocket.off('ACHIEVEMENT_STATUS_RESULT', handleAchievementResult);
});

const runExclusiveAchievementResponseRequest = async <T>(request: () => Promise<T>): Promise<T> => {
    const previousRequest = achievementResponseQueue;
    const runRequest = (async () => {
        if (previousRequest) {
            await previousRequest.catch(() => undefined);
        }
        return request();
    })();
    const trackedRequest = runRequest.finally(() => {
        if (achievementResponseQueue === trackedRequest) {
            achievementResponseQueue = null;
        }
    });
    achievementResponseQueue = trackedRequest;
    return runRequest;
};

export const resetAchievementAccountStateForTests = () => {
    achievementResponseQueue = null;
};

export const requestAchievementStatus = async () => {
    return runExclusiveAchievementResponseRequest(async () => {
        const resultPromise = waitForAchievementResult();
        gameWebSocket.send('ACHIEVEMENT_STATUS', {});
        return resultPromise;
    });
};

export const acknowledgeAchievementUnlocks = async (payload: AchievementAcknowledgeRequest = {}) => {
    return runExclusiveAchievementResponseRequest(async () => {
        const resultPromise = waitForAchievementResult();
        gameWebSocket.send('ACHIEVEMENT_ACK_NEW_UNLOCKS', {
            achievementIds: payload.achievementIds ?? []
        });
        return resultPromise;
    });
};
