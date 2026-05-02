import React, { useEffect, useState } from 'react';
import { ItemCard, GeishaSet } from 'game-shared-types';
import { getItemCardLabel, getGeishaCharmById, getItemCardImage } from '../../utils/gameData';

interface DrawCardModalProps {
    // 是否開啟視窗
    isOpen: boolean;
    // 抽到的卡片
    card: ItemCard | null;
    // 確認回呼
    onConfirm: () => void;
    // 藝妓組合
    geishaSet?: GeishaSet;
}

// 抽牌提示視窗（回合開始時顯示給自己）
const DrawCardModal: React.FC<DrawCardModalProps> = ({ isOpen, card, onConfirm, geishaSet }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsCollapsed(false);
    }, [card?.id, isOpen]);

    if (!isOpen || !card) {
        return null;
    }

    return (
        <div className="bottom-sheet">
            <div className="bottom-sheet__backdrop" />
            <div className={`bottom-sheet__panel ${isCollapsed ? 'is-collapsed' : ''}`}>
                <div className="bottom-sheet__header">
                    <h5 className="bottom-sheet__title">回合開始：你抽到一張牌</h5>
                    <button
                        className="bottom-sheet__toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? '展開' : '收合'}
                    </button>
                </div>
                {!isCollapsed && (
                    <div className="bottom-sheet__body text-center">
                        <div className="draw-card">
                            <div className="draw-card__inner">
                                <div
                                    className="draw-card__front"
                                    style={{ backgroundImage: `url(${getItemCardImage(card, geishaSet ?? 'default')})` }}
                                >
                                    <div className="fs-5">{getItemCardLabel(card, geishaSet ?? 'default')}</div>
                                    <small className="text-muted">魅力值 {getGeishaCharmById(card.geishaId)}</small>
                                </div>
                            </div>
                        </div>
                        <div className="text-muted small mt-2">此牌將加入你的手牌</div>
                        <button className="btn btn-primary w-100 mt-3" onClick={onConfirm}>
                            確認
                        </button>
                    </div>
                )}
                {isCollapsed && (
                    <button className="bottom-sheet__expand" onClick={() => setIsCollapsed(false)}>
                        展開操作
                    </button>
                )}
            </div>
        </div>
    );
};

export default DrawCardModal;
