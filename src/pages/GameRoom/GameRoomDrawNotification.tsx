import type { KeyboardEvent } from 'react';

interface GameRoomDrawNotificationProps {
    recentDraw: string | null;
    isActiveSelfDrawNotification: boolean;
    onDismiss: () => void;
    onViewNow: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, action: 'dismiss' | 'view_now') => void;
}

export const GameRoomDrawNotification = ({
    recentDraw,
    isActiveSelfDrawNotification,
    onDismiss,
    onViewNow,
    onKeyDown
}: GameRoomDrawNotificationProps) => (
    <>
        {recentDraw && (
            <div className="draw-toast shadow">{recentDraw}</div>
        )}

        {isActiveSelfDrawNotification && (
            <div className="draw-notification shadow" role="status" aria-label="抽牌通知">
                <div className="draw-notification__card-back" aria-hidden="true">
                    <span />
                </div>
                <div className="draw-notification__content">
                    <div className="draw-notification__title">你抽到一張新牌</div>
                    <div className="draw-notification__actions">
                        <button
                            type="button"
                            className="btn btn-outline-light btn-sm"
                            onClick={onDismiss}
                            onKeyDown={(event) => onKeyDown(event, 'dismiss')}
                        >
                            稍後確認
                        </button>
                        <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={onViewNow}
                            onKeyDown={(event) => onKeyDown(event, 'view_now')}
                        >
                            現在查看
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
);
