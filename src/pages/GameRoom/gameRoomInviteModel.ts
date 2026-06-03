import { InviteOutcome } from '../../utils/lineLiff';

export const getInviteOutcomeMessage = (outcome: InviteOutcome) => {
    switch (outcome.mode) {
        case 'share':
            return 'LINE 邀請已送出。';
        case 'copy':
            return '已複製邀請連結，請貼給好友。';
        case 'cancelled':
            return '已取消 LINE 好友選擇，可以重試或改用連結分享。';
        case 'unavailable':
            return '目前無法自動複製邀請連結，請手動複製下方連結分享。';
        case 'failed':
            return 'LINE 邀請暫時失敗，請改用下方連結分享。';
        default:
            return '邀請狀態已更新。';
    }
};

export const getInviteOutcomeTone = (outcome: InviteOutcome) => {
    if (outcome.mode === 'share' || outcome.mode === 'copy') return 'success';
    if (outcome.mode === 'cancelled' || outcome.mode === 'unavailable') return 'warning';
    return 'danger';
};

export const copyTextWithFallback = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return;
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
};
