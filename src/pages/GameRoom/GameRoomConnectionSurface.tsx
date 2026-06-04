type GameRoomConnectingSurfaceProps = {
    websocketUrl: string;
};

export const GameRoomConnectingSurface = ({ websocketUrl }: GameRoomConnectingSurfaceProps) => (
    <div className="game-background d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
            <div className="spinner-custom mb-3"></div>
            <h3>連接伺服器中...</h3>
            <small className="text-muted">
                正在連接到: {websocketUrl}
            </small>
        </div>
    </div>
);

type GameRoomErrorSurfaceProps = {
    error: string;
    onReturnToLobby: () => void;
};

export const GameRoomErrorSurface = ({ error, onReturnToLobby }: GameRoomErrorSurfaceProps) => (
    <div className="game-background d-flex align-items-center justify-content-center">
        <div className="card p-4 text-center" style={{ minWidth: 360, maxWidth: 520 }}>
            <h4 className="text-danger mb-3">無法進入對戰</h4>
            <p className="mb-4">{error}</p>
            <button className="btn btn-primary" onClick={onReturnToLobby}>返回大廳</button>
        </div>
    </div>
);
