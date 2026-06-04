import type { Player } from '@newhandarky/hanakoji-game-types';

interface GameRoomEndSheetProps {
    players: Player[];
    winner?: string;
    isCollapsed: boolean;
    isRematchRequested: boolean;
    getPlayerDisplayName: (playerId?: string) => string;
    onCollapse: () => void;
    onExpand: () => void;
    onReturnToLobby: () => void;
    onRequestRematch: () => void;
}

export const GameRoomEndSheet = ({
    players,
    winner,
    isCollapsed,
    isRematchRequested,
    getPlayerDisplayName,
    onCollapse,
    onExpand,
    onReturnToLobby,
    onRequestRematch
}: GameRoomEndSheetProps) => (
    <div className="bottom-sheet">
        <div className="bottom-sheet__backdrop" />
        <div className={`bottom-sheet__panel ${isCollapsed ? 'is-collapsed' : ''}`}>
            {!isCollapsed && (
                <>
                    <div className="bottom-sheet__header">
                        <button
                            className="bottom-sheet__toggle"
                            onClick={onCollapse}
                        >
                            查看戰況
                        </button>
                    </div>
                    <div className="bottom-sheet__body bottom-sheet__body--full">
                        <div className="text-center mb-3">
                            <h2 className="text-success mb-2">🎉 遊戲結束！</h2>
                            <p className="fs-5 mb-0">獲勝者: <strong>{getPlayerDisplayName(winner)}</strong></p>
                        </div>
                        <div className="mb-4">
                            {players.map((player) => (
                                <div key={player.id} className="d-flex justify-content-between mb-1">
                                    <span className="fw-semibold">{getPlayerDisplayName(player.id)}</span>
                                    <span>魅力 {player.score?.charm || 0} / 藝妓 {player.score?.tokens || 0}</span>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-primary" onClick={onReturnToLobby}>
                                返回大廳
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                onClick={onRequestRematch}
                                disabled={isRematchRequested}
                            >
                                {isRematchRequested ? '等待對手...' : '再來一場'}
                            </button>
                        </div>
                    </div>
                </>
            )}
            {isCollapsed && (
                <button
                    className="bottom-sheet__expand"
                    onClick={onExpand}
                >
                    展開結算
                </button>
            )}
        </div>
    </div>
);
