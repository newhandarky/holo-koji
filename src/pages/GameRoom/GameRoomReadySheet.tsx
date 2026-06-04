import type { Player, ReadyStatusPayload } from '@newhandarky/hanakoji-game-types';

interface GameRoomReadySheetProps {
    readyStatus: ReadyStatusPayload;
    players: Player[];
    getPlayerDisplayName: (playerId?: string) => string;
    onConfirmReady: () => void;
}

export const GameRoomReadySheet = ({
    readyStatus,
    players,
    getPlayerDisplayName,
    onConfirmReady
}: GameRoomReadySheetProps) => (
    <div className="bottom-sheet">
        <div className="bottom-sheet__backdrop" />
        <div className="bottom-sheet__panel">
            <div className="bottom-sheet__header">
                <h5 className="bottom-sheet__title">準備開始</h5>
            </div>
            <div className="bottom-sheet__body">
                <p>請確認已準備好開始新對戰。</p>
                <div className="d-flex flex-column gap-2 mb-3">
                    {players.map((player) => (
                        <div key={player.id} className="d-flex justify-content-between">
                            <span>{getPlayerDisplayName(player.id)}</span>
                            <span>
                                {readyStatus.confirmations.includes(player.id) ? '✅ 已準備' : '⏳ 等待中'}
                            </span>
                        </div>
                    ))}
                </div>
                <button className="btn btn-primary w-100" onClick={onConfirmReady}>
                    我準備好了
                </button>
            </div>
        </div>
    </div>
);
