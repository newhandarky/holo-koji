import React from 'react';
import { ItemCard, GeishaSet } from '@newhandarky/hanakoji-game-types';
import { getItemCardImage, getGeishaCharmById } from '../../utils/gameData';

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
    // 藝妓組合
    geishaSet?: GeishaSet;
    showResultMotionHint?: boolean;
    prefersReducedMotion?: boolean;
}

const renderCard = (card: ItemCard, getCharmByGeishaId?: (geishaId: number) => number, geishaSet?: GeishaSet) => (
    <div
        key={card.id}
        className="item-card item-card--image item-card--mini"
        style={{ backgroundImage: `url(${getItemCardImage(card, geishaSet ?? 'default')})` }}
    >
        <div className="item-card__overlay" />
    </div>
);

const getCardCharm = (card: ItemCard, getCharmByGeishaId?: (geishaId: number) => number) =>
    getCharmByGeishaId?.(card.geishaId) ?? getGeishaCharmById(card.geishaId);

const getGroupCharmTotal = (cards: ItemCard[], getCharmByGeishaId?: (geishaId: number) => number) =>
    cards.reduce((total, card) => total + getCardCharm(card, getCharmByGeishaId), 0);

// 競爭分組選擇視窗（提供 3 種不考慮順序的分組）
const CompetitionGroupModal: React.FC<CompetitionGroupModalProps> = ({
    isOpen,
    cards,
    onSelect,
    onClose,
    getCharmByGeishaId,
    geishaSet,
    showResultMotionHint = false,
    prefersReducedMotion = false
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
            <div className={`bottom-sheet__panel ${showResultMotionHint ? 'bottom-sheet__panel--motion-source' : ''} ${showResultMotionHint && prefersReducedMotion ? 'bottom-sheet__panel--motion-reduced' : ''}`}>
                <div className="bottom-sheet__header">
                    <button className="btn-close" onClick={onClose} aria-label="關閉" />
                </div>
                <div className="bottom-sheet__body">
                    <p>請選擇要提供給對手的分組方式（對手會從兩組中選 1 組）：</p>
                    {groups.map((group, index) => (
                        <div key={index} className="competition-option">
                            <div className="competition-option__groups">
                                <div className="competition-option__group">
                                    <div className="competition-option__cards">
                                        {group[0].map((card) => renderCard(card, getCharmByGeishaId, geishaSet))}
                                    </div>
                                    <div className="competition-option__total">A 組魅力合計：{getGroupCharmTotal(group[0], getCharmByGeishaId)}</div>
                                </div>
                                <div className="competition-option__group">
                                    <div className="competition-option__cards">
                                        {group[1].map((card) => renderCard(card, getCharmByGeishaId, geishaSet))}
                                    </div>
                                    <div className="competition-option__total">B 組魅力合計：{getGroupCharmTotal(group[1], getCharmByGeishaId)}</div>
                                </div>
                            </div>
                            <button
                                className="btn btn-outline-danger btn-sm mt-2 w-100 competition-option__submit"
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
