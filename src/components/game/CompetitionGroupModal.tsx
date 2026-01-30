import React from 'react';
import { ItemCard } from 'game-shared-types';
import { getGeishaCardImageById, getGeishaCharmById } from '../../utils/gameData';

interface CompetitionGroupModalProps {
    // 是否開啟視窗
    isOpen: boolean;
    // 參與競爭的 4 張卡
    cards: ItemCard[];
    // 分組完成回呼
    onSelect: (groups: string[][]) => void;
    // 關閉視窗回呼
    onClose: () => void;
    // 取得魅力值（以伺服器資料為主）
    getCharmByGeishaId?: (geishaId: number) => number;
}

const renderCard = (card: ItemCard, getCharmByGeishaId?: (geishaId: number) => number) => (
    <div
        key={card.id}
        className="item-card item-card--image item-card--mini"
        style={{ backgroundImage: `url(${getGeishaCardImageById(card.geishaId)})` }}
    >
        <div className="item-card__overlay" />
        <div className="item-card__badge">魅力 {getCharmByGeishaId?.(card.geishaId) ?? getGeishaCharmById(card.geishaId)}</div>
    </div>
);

// 競爭分組選擇視窗（提供 3 種不考慮順序的分組）
const CompetitionGroupModal: React.FC<CompetitionGroupModalProps> = ({
    isOpen,
    cards,
    onSelect,
    onClose,
    getCharmByGeishaId
}) => {
    if (!isOpen || cards.length !== 4) {
        return null;
    }

    // 固定 3 種分組（不考慮順序）
    const groups = [
        [[cards[0], cards[1]], [cards[2], cards[3]]],
        [[cards[0], cards[2]], [cards[1], cards[3]]],
        [[cards[0], cards[3]], [cards[1], cards[2]]]
    ];

    return (
        <div className="bottom-sheet">
            <div className="bottom-sheet__backdrop" />
            <div className="bottom-sheet__panel">
                <div className="bottom-sheet__header">
                    <button className="btn-close" onClick={onClose} aria-label="關閉" />
                </div>
                <div className="bottom-sheet__body">
                    <p>請選擇要提供給對手的分組方式（對手會從兩組中選 1 組）：</p>
                    {groups.map((group, index) => (
                        <div key={index} className="border rounded p-2 mb-3">
                            <div className="row">
                                <div className="col-6">
                                    <div className="d-flex flex-wrap justify-content-center">
                                        {group[0].map((card) => renderCard(card, getCharmByGeishaId))}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex flex-wrap justify-content-center">
                                        {group[1].map((card) => renderCard(card, getCharmByGeishaId))}
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
    );
};

export default CompetitionGroupModal;
