import type { Player } from '@newhandarky/hanakoji-game-types';

interface GameRoomRoundSummaryOverlayProps {
    roundSummary: { round: number };
    players: Player[];
    getPlayerDisplayName: (playerId?: string) => string;
}

export const GameRoomRoundSummaryOverlay = ({
    roundSummary,
    players,
    getPlayerDisplayName
}: GameRoomRoundSummaryOverlayProps) => (
    <div className="round-summary-overlay">
        <div className="round-summary-card shadow">
            <h4 className="mb-2">第 {roundSummary.round} 回合結算完成</h4>
            <p className="text-muted mb-3">好感指示物已更新，準備進入下一回合</p>
            <div className="d-flex flex-column gap-2">
                {players.map((player) => (
                    <div key={player.id} className="round-summary-row">
                        <span className="fw-semibold">{getPlayerDisplayName(player.id)}</span>
                        <span>魅力 {player.score?.charm || 0}</span>
                        <span>藝妓 {player.score?.tokens || 0}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
