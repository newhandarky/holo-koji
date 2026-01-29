import React from 'react';
import { ItemCard, PendingInteraction, GameAction, Geisha, Player } from 'game-shared-types';
import { getGeishaCardImageById, getGeishaCharmById, getGeishaImageById } from '../../utils/gameData';

interface PendingInteractionModalProps {
    // 互動內容（贈予 / 競爭）
    interaction: PendingInteraction;
    // 自己的玩家 ID
    playerId: string;
    // 回應互動的回呼
    onResolve: (action: GameAction) => void;
    // 當前玩家資料
    players: Player[];
    // 藝妓資料
    geishas: Geisha[];
    // 房主 ID（判斷陣營顏色）
    hostId: string;
}

const renderCard = (card: ItemCard) => (
    <div
        key={card.id}
        className="item-card item-card--image item-card--mini"
        style={{ backgroundImage: `url(${getGeishaCardImageById(card.geishaId)})` }}
    >
        <div className="item-card__overlay" />
        <div className="item-card__badge">魅力 {getGeishaCharmById(card.geishaId)}</div>
    </div>
);

const PendingInteractionModal: React.FC<PendingInteractionModalProps> = ({ interaction, playerId, onResolve, players, geishas, hostId }) => {
    const currentPlayer = players.find(player => player.id === playerId);
    const opponentPlayer = players.find(player => player.id !== playerId);
    const myCamp = playerId === hostId ? 'host' : 'guest';
    const opponentCamp = playerId === hostId ? 'guest' : 'host';

    const buildCountMap = (player: Player | undefined) => {
        const map = new Map<number, number>();
        if (!player) {
            return map;
        }
        player.playedCards.forEach((card) => {
            map.set(card.geishaId, (map.get(card.geishaId) ?? 0) + 1);
        });
        return map;
    };

    const myCounts = buildCountMap(currentPlayer);
    const oppCounts = buildCountMap(opponentPlayer);
    // 贈予：選 1 張
    if (interaction.type === 'GIFT_SELECTION') {
        return (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-info text-white">
                            <h5 className="modal-title">選擇贈予卡片</h5>
                        </div>
                        <div className="modal-body interaction-modal-body">
                            <p>對手提供了下列卡片，請挑選 1 張：</p>
                            <div className="gift-selection-grid">
                                {interaction.offeredCards.map((card) => (
                                    <button
                                        key={card.id}
                                        className="gift-selection-card"
                                        onClick={() => onResolve({
                                            type: 'RESOLVE_GIFT',
                                            payload: { playerId, chosenCardId: card.id }
                                        })}
                                    >
                                        {renderCard(card)}
                                        <span className="gift-selection-label">選擇此卡</span>
                                    </button>
                                ))}
                            </div>
                            <div className="interaction-summary mt-3">
                                <div className="interaction-summary__header">目前戰況</div>
                                <div className="battle-summary-grid">
                                    {geishas.map((geisha) => (
                                        <div
                                            key={geisha.id}
                                            className="battle-geisha-card"
                                            style={{ backgroundImage: `url(${getGeishaImageById(geisha.id)})` }}
                                        >
                                            <div className="battle-geisha-overlay" />
                                            <div className="battle-geisha-score">魅力 {geisha.charmPoints}</div>
                                            <div className="battle-geisha-chips battle-geisha-chips--opponent">
                                                {Array.from({ length: oppCounts.get(geisha.id) ?? 0 }).map((_, index) => (
                                                    <span
                                                        key={`opp-${geisha.id}-${index}`}
                                                        className={`geisha-score-chip geisha-score-chip--${opponentCamp}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="battle-geisha-chips battle-geisha-chips--mine">
                                                {Array.from({ length: myCounts.get(geisha.id) ?? 0 }).map((_, index) => (
                                                    <span
                                                        key={`mine-${geisha.id}-${index}`}
                                                        className={`geisha-score-chip geisha-score-chip--${myCamp}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 競爭：選 1 組
    if (interaction.type === 'COMPETITION_SELECTION') {
        return (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-warning">
                            <h5 className="modal-title">競爭分組選擇</h5>
                        </div>
                        <div className="modal-body interaction-modal-body">
                            <p>對手分成兩組，請挑選其中一組：</p>
                            {interaction.groups.map((group, index) => (
                                <div key={index} className="border rounded p-2 mb-2">
                                    <div className="d-flex flex-wrap">
                                        {group.map(renderCard)}
                                    </div>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => onResolve({
                                            type: 'RESOLVE_COMPETITION',
                                            payload: { playerId, chosenGroupIndex: index }
                                        })}
                                    >
                                        選擇此組
                                    </button>
                                </div>
                            ))}
                            <div className="interaction-summary mt-3">
                                <div className="interaction-summary__header">目前戰況</div>
                                <div className="battle-summary-grid">
                                    {geishas.map((geisha) => (
                                        <div
                                            key={geisha.id}
                                            className="battle-geisha-card"
                                            style={{ backgroundImage: `url(${getGeishaImageById(geisha.id)})` }}
                                        >
                                            <div className="battle-geisha-overlay" />
                                            <div className="battle-geisha-score">魅力 {geisha.charmPoints}</div>
                                            <div className="battle-geisha-chips battle-geisha-chips--opponent">
                                                {Array.from({ length: oppCounts.get(geisha.id) ?? 0 }).map((_, index) => (
                                                    <span
                                                        key={`opp-${geisha.id}-${index}`}
                                                        className={`geisha-score-chip geisha-score-chip--${opponentCamp}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="battle-geisha-chips battle-geisha-chips--mine">
                                                {Array.from({ length: myCounts.get(geisha.id) ?? 0 }).map((_, index) => (
                                                    <span
                                                        key={`mine-${geisha.id}-${index}`}
                                                        className={`geisha-score-chip geisha-score-chip--${myCamp}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 其他情況不顯示
    return null;
};

export default PendingInteractionModal;
