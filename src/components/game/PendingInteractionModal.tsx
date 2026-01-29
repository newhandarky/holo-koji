import React from 'react';
import { ItemCard, PendingInteraction, GameAction } from 'game-shared-types';
import { getGeishaCardImageById, getGeishaCharmById } from '../../utils/gameData';

interface PendingInteractionModalProps {
    interaction: PendingInteraction;
    playerId: string;
    onResolve: (action: GameAction) => void;
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

const PendingInteractionModal: React.FC<PendingInteractionModalProps> = ({ interaction, playerId, onResolve }) => {
    if (interaction.type === 'GIFT_SELECTION') {
        return (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-info text-white">
                            <h5 className="modal-title">選擇贈予卡片</h5>
                        </div>
                        <div className="modal-body">
                            <p>對手提供了下列卡片，請挑選 1 張：</p>
                            <div className="d-flex flex-wrap">
                                {interaction.offeredCards.map((card) => (
                                    <button
                                        key={card.id}
                                        className="btn btn-outline-primary m-1"
                                        onClick={() => onResolve({
                                            type: 'RESOLVE_GIFT',
                                            payload: { playerId, chosenCardId: card.id }
                                        })}
                                    >
                                        選擇此卡
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (interaction.type === 'COMPETITION_SELECTION') {
        return (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-warning">
                            <h5 className="modal-title">競爭分組選擇</h5>
                        </div>
                        <div className="modal-body">
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default PendingInteractionModal;
