import { useCallback, useState } from 'react';
import { getLiffInviteUrl, InviteOutcome, shareRoomInvite } from '../../utils/lineLiff';
import { frontendLogger } from '../../utils/runtimeLogger';
import { copyTextWithFallback } from './gameRoomInviteModel';

interface UseGameRoomInviteActionsOptions {
    roomId?: string;
}

export const useGameRoomInviteActions = ({ roomId }: UseGameRoomInviteActionsOptions) => {
    const [showRoomCode, setShowRoomCode] = useState(false);
    const [inviteOutcome, setInviteOutcome] = useState<InviteOutcome | null>(null);

    const toggleRoomCode = useCallback(() => {
        setShowRoomCode((current) => !current);
    }, []);

    const copyRoomCode = useCallback(async () => {
        if (!roomId) return;
        await copyTextWithFallback(roomId);
        alert('房間代碼已複製到剪貼簿！');
    }, [roomId]);

    const handleShareRoomInvite = useCallback(async () => {
        if (!roomId) return;
        const result = await shareRoomInvite(roomId);
        setInviteOutcome(result);

        if (result.mode === 'failed') {
            frontendLogger.warn('⚠️ LINE 邀請失敗', {
                roomId,
                reason: result.reason
            });
        }
    }, [roomId]);

    const openLineInvite = useCallback(() => {
        if (!roomId) return;
        window.location.href = getLiffInviteUrl(roomId);
    }, [roomId]);

    return {
        showRoomCode,
        inviteOutcome,
        toggleRoomCode,
        copyRoomCode,
        handleShareRoomInvite,
        openLineInvite
    };
};
