import React from 'react';
import { ItemCard } from 'game-shared-types';
import { getGeishaNameById, getGeishaCharmById } from '../../utils/gameData';

interface DrawCardModalProps {
    isOpen: boolean;
    card: ItemCard | null;
    onConfirm: () => void;
}

// 抽牌提示視窗（回合開始時顯示給自己）
const DrawCardModal: React.FC<DrawCardModalProps> = ({ isOpen, card, onConfirm }) => {
    if (!isOpen || !card) {
        return null;
    }

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">回合開始：你抽到一張牌</h5>
                    </div>
                    <div className="modal-body text-center">
                        <div className="draw-card">
                            <div className="draw-card__inner">
                                    <div className="draw-card__front">
                                        <div className="fs-5">{getGeishaNameById(card.geishaId)}</div>
                                        <small className="text-muted">魅力值 {getGeishaCharmById(card.geishaId)}</small>
                                    </div>
                            </div>
                        </div>
                        <div className="text-muted small mt-2">此牌將加入你的手牌</div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary w-100" onClick={onConfirm}>
                            確認
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawCardModal;
