import { useCallback, useMemo, useState } from 'react';
import type { GameState, GeishaSet, Player } from '@newhandarky/hanakoji-game-types';
import { actionStatusConfig } from '../../utils/actionAssets';
import { getItemCardImage } from '../../utils/gameData';
import { buildGameRoomReplayModel, ReplayActionType } from './gameRoomInteractionModel';

interface GameRoomInfoPanelProps {
    state: GameState;
    currentPlayerId: string;
    currentPlayer: Player | null;
    hostId: string;
    activeTurnPlayerName: string;
    displayName: string;
    activeGeishaSet: GeishaSet;
    getPlayerDisplayName: (playerId?: string) => string;
    getPlayerAvatar: (playerId?: string) => string;
    onReturnToLobby: () => void;
}

export const GameRoomInfoPanel = ({
    state,
    currentPlayerId,
    currentPlayer,
    hostId,
    activeTurnPlayerName,
    displayName,
    activeGeishaSet,
    getPlayerDisplayName,
    getPlayerAvatar,
    onReturnToLobby
}: GameRoomInfoPanelProps) => {
    const [expandedInfoReplayAction, setExpandedInfoReplayAction] = useState<ReplayActionType>(null);
    const replayModel = useMemo(() => buildGameRoomReplayModel({
        currentPlayer,
        currentPlayerId,
        expandedInfoReplayAction
    }), [currentPlayer, currentPlayerId, expandedInfoReplayAction]);

    const handleInfoActionIconClick = useCallback((playerId: string, actionType: Parameters<typeof replayModel.isReplayEligible>[1]) => {
        if (!replayModel.isReplayEligible(playerId, actionType)) {
            return;
        }
        if (actionType === 'secret' || actionType === 'trade-off') {
            setExpandedInfoReplayAction(actionType);
        }
    }, [replayModel]);

    return (
        <div className="game-focus-content game-info-panel">
            <div className="game-info-status-row mb-3">
                <div className="game-info-status-row__current">
                    {activeTurnPlayerName === displayName ? '你的回合' : '對手的回合'}
                </div>
                <button
                    type="button"
                    className="btn btn-outline-danger btn-sm game-info-status-row__leave"
                    onClick={() => {
                        if (window.confirm('確定要離開遊戲嗎？')) {
                            onReturnToLobby();
                        }
                    }}
                >
                    離開遊戲
                </button>
            </div>
            <div className="row mb-3 gy-3">
                {state.players.map((player, index) => {
                    const campClass = player.id === hostId ? 'player-card--host' : 'player-card--guest';
                    const actionUsedMap = new Map(player.actionTokens.map((token) => [token.type, token.used]));
                    const isLocalPlayerRow = player.id === currentPlayerId;
                    const activeReplayCards = isLocalPlayerRow ? replayModel.activeReplayCards : [];

                    return (
                        <div key={player.id} className="col-md-6 mb-2">
                            <div className={`card player-card ${campClass} ${index === state.currentPlayer ? 'bg-light' : ''}`}>
                                <div className="card-body py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="d-inline-flex align-items-center gap-2">
                                            {getPlayerAvatar(player.id) && (
                                                <img
                                                    className="player-avatar"
                                                    src={getPlayerAvatar(player.id)}
                                                    alt={`${getPlayerDisplayName(player.id)} 頭像`}
                                                />
                                            )}
                                            <strong>{getPlayerDisplayName(player.id)}</strong>
                                            {index === state.currentPlayer && <span className="badge bg-warning text-dark ms-2">進行中</span>}
                                            {index === 0 && <span className="badge bg-info text-white ms-2">房主</span>}
                                        </span>
                                        <small className="text-muted">
                                            手牌: {player.hand.length}
                                            <br />
                                            魅力: {player.score?.charm || 0} / 藝妓: {player.score?.tokens || 0}
                                        </small>
                                    </div>
                                    <div className="game-info-action-row mt-2">
                                        {actionStatusConfig.map((actionItem) => {
                                            const used = actionUsedMap.get(actionItem.type) ?? false;
                                            const replayEligible = replayModel.isReplayEligible(player.id, actionItem.type);
                                            const isReplayActive = replayEligible && expandedInfoReplayAction === actionItem.type;
                                            const classNames = [
                                                'game-info-action',
                                                used ? 'is-used' : 'is-available',
                                                replayEligible ? 'is-replayable' : 'is-status-only',
                                                isReplayActive ? 'is-replay-active' : ''
                                            ].filter(Boolean).join(' ');

                                            return (
                                                <button
                                                    key={`${player.id}-${actionItem.type}`}
                                                    type="button"
                                                    className={classNames}
                                                    onClick={() => handleInfoActionIconClick(player.id, actionItem.type)}
                                                    disabled={!replayEligible}
                                                    aria-label={`${actionItem.label}${used ? '（已使用）' : '（未使用）'}`}
                                                >
                                                    <img className="game-info-action__icon" src={actionItem.iconUrl} alt={actionItem.label} />
                                                    <span className="game-info-action__label">{actionItem.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {isLocalPlayerRow && expandedInfoReplayAction && activeReplayCards.length > 0 && (
                                        <div className="game-info-replay mt-2">
                                            <div className="game-info-replay__title">
                                                {expandedInfoReplayAction === 'secret' ? '密約回看' : '取捨回看'}
                                            </div>
                                            <div className="game-info-replay__cards">
                                                {activeReplayCards.map((card) => (
                                                    <div
                                                        key={card.id}
                                                        className="item-card item-card--image item-card--mini"
                                                        style={{ backgroundImage: `url(${getItemCardImage(card, activeGeishaSet)})` }}
                                                    >
                                                        <div className="item-card__overlay" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
