import type { GameState } from '@newhandarky/hanakoji-game-types';
import { InviteOutcome, isLineClient } from '../../utils/lineLiff';
import { getInviteOutcomeMessage, getInviteOutcomeTone } from './gameRoomInviteModel';

interface GameRoomWaitingPanelProps {
    state: GameState;
    roomId?: string;
    displayName: string;
    displayAvatar: string;
    isMyTurn: boolean;
    showRoomCode: boolean;
    inviteOutcome: InviteOutcome | null;
    getPlayerDisplayName: (playerId?: string) => string;
    onToggleRoomCode: () => void;
    onCopyRoomCode: () => void;
    onShareRoomInvite: () => void;
    onOpenLineInvite: () => void;
    onReturnToLobby: () => void;
}

export const GameRoomWaitingPanel = ({
    state,
    roomId,
    displayName,
    displayAvatar,
    isMyTurn,
    showRoomCode,
    inviteOutcome,
    getPlayerDisplayName,
    onToggleRoomCode,
    onCopyRoomCode,
    onShareRoomInvite,
    onOpenLineInvite,
    onReturnToLobby
}: GameRoomWaitingPanelProps) => {
    const isInLineClient = isLineClient();

    return (
        <div className="game-background d-flex align-items-center justify-content-center">
            <div className="card p-4 text-center" style={{ minWidth: 450 }}>
                <div className={`turn-status-banner ${isMyTurn ? 'turn-status-banner--active' : ''}`}>
                    <div className="d-flex align-items-center gap-2">
                        {displayAvatar && (
                            <img
                                className="player-avatar"
                                src={displayAvatar}
                                alt={`${displayName} 頭像`}
                                width={28}
                                height={28}
                                loading="lazy"
                                decoding="async"
                            />
                        )}
                        <p className='mb-0'>你是：
                            <strong>{displayName}</strong>
                        </p>
                    </div>
                    <div>{isMyTurn ? '你的回合' : '等待對手'}</div>
                </div>
                <div className="spinner-custom mb-3"></div>
                <h4>等待對手加入</h4>

                <div className="alert alert-primary">
                    <div className="waiting-room-actions-group mb-2">
                        <div className="waiting-room-actions">
                            <button
                                className="btn btn-outline-primary btn-sm waiting-room-button"
                                onClick={onToggleRoomCode}
                            >
                                {showRoomCode ? '隱藏' : '顯示'}
                            </button>
                            <button className="btn btn-primary btn-sm waiting-room-button" onClick={onCopyRoomCode}>
                                複製
                            </button>
                        </div>
                        <div className={`waiting-room-actions ${!isInLineClient && roomId ? '' : 'waiting-room-actions--single'}`}>
                            <button
                                className="btn btn-success btn-sm waiting-room-button"
                                onClick={onShareRoomInvite}
                            >
                                LINE 邀請好友
                            </button>
                            {!isInLineClient && roomId && (
                                <button
                                    className="btn btn-outline-success btn-sm waiting-room-button"
                                    onClick={onOpenLineInvite}
                                >
                                    用 LINE 開啟
                                </button>
                            )}
                        </div>
                    </div>

                    {!isInLineClient && (
                        <div className="mt-2 text-muted">
                            <small>提示：請在 LINE App 內開啟，才能使用選擇好友功能。</small>
                        </div>
                    )}

                    {inviteOutcome && (
                        <div className={`waiting-room-invite-feedback waiting-room-invite-feedback--${getInviteOutcomeTone(inviteOutcome)}`} role="status">
                            <div>{getInviteOutcomeMessage(inviteOutcome)}</div>
                            {inviteOutcome.url && (
                                <code className="waiting-room-invite-feedback__url">{inviteOutcome.url}</code>
                            )}
                        </div>
                    )}

                    {showRoomCode && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <small className="text-muted">
                                分享此代碼給朋友加入遊戲：<br />
                                <code className="fs-6">{roomId}</code>
                            </small>
                        </div>
                    )}
                </div>

                <div className="alert alert-info">
                    <strong>目前玩家: {state.players.length}/2</strong>
                    {state.players.length > 0 && (
                        <div className="mt-2">
                            <small>已加入玩家:</small>
                            <ul className="list-unstyled mt-1">
                                {state.players.map((player, index) => (
                                    <li key={player.id} className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <span className="badge bg-secondary me-2">{index + 1}</span>
                                            {getPlayerDisplayName(player.id)}
                                        </span>
                                        {index === 0 && <span className="badge bg-warning text-dark">房主</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="text-muted small mb-3">
                    {state.players.length === 0 && '初始化中...'}
                    {state.players.length === 1 && '等待第二位玩家加入...'}
                </div>

                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={onReturnToLobby}
                >
                    返回大廳
                </button>
            </div>
        </div>
    );
};
