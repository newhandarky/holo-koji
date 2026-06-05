import React from 'react';

interface NoticeSectionProps {
    accountGuestNotice?: string;
    invitedRoomNotice?: string;
    inviteRecovery?: {
        roomId: string;
        message: string;
    } | null;
    onCopyInviteRoomId: () => void;
    onClearInviteRecovery: () => void;
}

export const LobbyNoticeSection: React.FC<NoticeSectionProps> = ({
    accountGuestNotice,
    invitedRoomNotice,
    inviteRecovery,
    onCopyInviteRoomId,
    onClearInviteRecovery
}) => (
    <>
        {accountGuestNotice && (
            <div className="lobby-account-notice" role="status">
                {accountGuestNotice}
            </div>
        )}

        {invitedRoomNotice && (
            <div className="lobby-invite-notice" role="status">
                {invitedRoomNotice}
            </div>
        )}

        {inviteRecovery && (
            <div className="lobby-invite-recovery" role="alert">
                <div className="lobby-invite-recovery__message">{inviteRecovery.message}</div>
                <code className="lobby-invite-recovery__room">{inviteRecovery.roomId}</code>
                <div className="lobby-invite-recovery__actions">
                    <button type="button" className="btn btn-outline-light btn-sm" onClick={onCopyInviteRoomId}>
                        複製房號
                    </button>
                    <button type="button" className="btn btn-outline-light btn-sm" onClick={onClearInviteRecovery}>
                        回到一般加入
                    </button>
                </div>
                <div className="lobby-invite-recovery__hint">可請對方重送邀請，或回到建立/加入房間流程。</div>
            </div>
        )}
    </>
);
