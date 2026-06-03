import type { AccountSyncResult } from '@newhandarky/hanakoji-game-types';

export interface LineCallbackOutcome {
    message: string;
    shouldReturnToLobby: boolean;
}

export const getLineCallbackOutcome = (result: AccountSyncResult): LineCallbackOutcome => {
    if (result.status === 'bound') {
        return {
            message: 'LINE 帳號綁定完成，正在返回大廳。',
            shouldReturnToLobby: true
        };
    }

    return {
        message: result.guestNotice ?? 'LINE 帳號綁定失敗，請回到大廳重試。',
        shouldReturnToLobby: false
    };
};
