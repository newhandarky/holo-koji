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

const waitForAchievementResult = () => new Promise<AchievementStatusResult>((resolve) => {
    const timeoutId = setTimeout(() => {
        gameWebSocket.off('ACHIEVEMENT_STATUS_RESULT');
        resolve(unavailableResult);
    }, ACHIEVEMENT_TIMEOUT_MS);

    gameWebSocket.on('ACHIEVEMENT_STATUS_RESULT', (payload: AchievementStatusResult) => {
        clearTimeout(timeoutId);
        gameWebSocket.off('ACHIEVEMENT_STATUS_RESULT');
        resolve(payload);
    });
});

export const requestAchievementStatus = async () => {
    const resultPromise = waitForAchievementResult();
    gameWebSocket.send('ACHIEVEMENT_STATUS', {});
    return resultPromise;
};

export const acknowledgeAchievementUnlocks = async (payload: AchievementAcknowledgeRequest = {}) => {
    const resultPromise = waitForAchievementResult();
    gameWebSocket.send('ACHIEVEMENT_ACK_NEW_UNLOCKS', {
        achievementIds: payload.achievementIds ?? []
    });
    return resultPromise;
};
