import React from 'react';

type MatchMode = 'online' | 'npc';

interface CreateRoomSectionProps {
    playerName: string;
    isConnecting: boolean;
    canCreateRoom: boolean;
    onPlayerNameChange: (value: string) => void;
    onCreateRoom: () => void;
}

export const LobbyCreateRoomSection: React.FC<CreateRoomSectionProps> = ({
    playerName,
    isConnecting,
    canCreateRoom,
    onPlayerNameChange,
    onCreateRoom
}) => (
    <>
        <label className="form-label">玩家名稱</label>
        <input
            type="text"
            className="form-control mb-3"
            placeholder="輸入你的名稱"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            disabled={isConnecting}
            maxLength={20}
        />
        <button className="btn btn-primary w-100 lobby-primary-button" onClick={onCreateRoom} disabled={!canCreateRoom}>
            {isConnecting ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    建立中...
                </>
            ) : '🏠 建立房間'}
        </button>
    </>
);

interface JoinRoomSectionProps {
    roomId: string;
    matchMode: MatchMode;
    isConnecting: boolean;
    canJoinRoom: boolean;
    onRoomIdChange: (value: string) => void;
    onJoinRoom: () => void;
}

export const LobbyJoinRoomSection: React.FC<JoinRoomSectionProps> = ({
    roomId,
    matchMode,
    isConnecting,
    canJoinRoom,
    onRoomIdChange,
    onJoinRoom
}) => {
    if (matchMode !== 'online') {
        return null;
    }

    return (
        <div className="lobby-form-block lobby-form-block--secondary">
            <label className="form-label">加入房間</label>
            <input
                type="text"
                className="form-control mb-2"
                placeholder="輸入房間代碼"
                value={roomId}
                onChange={(event) => onRoomIdChange(event.target.value.toUpperCase())}
                disabled={isConnecting}
                maxLength={6}
            />
            <button
                className="btn btn-outline-light w-100 lobby-secondary-button"
                onClick={onJoinRoom}
                disabled={!canJoinRoom}
            >
                {isConnecting ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        加入中...
                    </>
                ) : '🚪 加入房間'}
            </button>
        </div>
    );
};
