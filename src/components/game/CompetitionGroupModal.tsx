import React from 'react';
import { ItemCard } from 'game-shared-types';
import { getGeishaCardImageById, getGeishaCharmById } from '../../utils/gameData';

interface CompetitionGroupModalProps {
    isOpen: boolean;
    cards: ItemCard[];
    onSelect: (groups: string[][]) => void;
    onClose: () => void;
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

// 競爭分組選擇視窗（提供 3 種不考慮順序的分組）
const CompetitionGroupModal: React.FC<CompetitionGroupModalProps> = ({
    isOpen,
    cards,
    onSelect,
    onClose
}) => {
    if (!isOpen || cards.length !== 4) {
        return null;
    }

    const groups = [
        [[cards[0], cards[1]], [cards[2], cards[3]]],
        [[cards[0], cards[2]], [cards[1], cards[3]]],
        [[cards[0], cards[3]], [cards[1], cards[2]]]
    ];

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-warning">
                        <h5 className="modal-title">競爭分組選擇</h5>
                        <button className="btn-close" onClick={onClose} aria-label="關閉" />
                    </div>
                    <div className="modal-body">
                        <p>請選擇要提供給對手的分組方式（對手會從兩組中選 1 組）：</p>
                        {groups.map((group, index) => (
                            <div key={index} className="border rounded p-2 mb-3">
                                <div className="row">
                                    <div className="col-6">
                                        <div className="d-flex flex-wrap justify-content-center">
                                            {group[0].map(renderCard)}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex flex-wrap justify-content-center">
                                            {group[1].map(renderCard)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-outline-danger btn-sm mt-2 w-100"
                                    onClick={() => onSelect(group.map(list => list.map(card => card.id)))}
                                >
                                    使用此分組
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionGroupModal;
