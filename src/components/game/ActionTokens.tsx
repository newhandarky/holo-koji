// src/components/game/ActionTokens.tsx
import React, { useState } from 'react';
import { ActionToken, ItemCard, GeishaSet } from "game-shared-types"
import { getItemCardImage } from '../../utils/gameData';
import { actionIconMap } from '../../utils/actionAssets';

/**
 * ActionTokens 組件：顯示並觸發行動標誌
 */
interface Props {
    tokens: ActionToken[];                            // 可用行動標誌
    onAction: (type: ActionToken['type']) => void;    // 點擊行動回呼
    disabled?: boolean;                               // 是否暫時停用
    usedCards?: Partial<Record<ActionToken['type'], ItemCard[]>>; // 已使用行動的卡牌資訊
    getCharmByGeishaId?: (geishaId: number) => number; // 取得魅力值（以伺服器資料為主）
    geishaSet?: GeishaSet;                            // 藝妓組合
}

const ActionTokens: React.FC<Props> = ({ tokens, onAction, disabled, usedCards, getCharmByGeishaId, geishaSet }) => {
    const [openToken, setOpenToken] = useState<ActionToken['type'] | null>(null);

    const handleTokenClick = (token: ActionToken) => {
        const cards = usedCards?.[token.type] ?? [];
        const canInspect = token.used && cards.length > 0 && (token.type === 'secret' || token.type === 'trade-off');

        if (canInspect) {
            setOpenToken(prev => (prev === token.type ? null : token.type));
            return;
        }

        if (!token.used) {
            onAction(token.type);
        }
    };

    const renderUsedCards = (cards: ItemCard[]) => (
        <div className="action-token__popover">
            <div className="action-token__popover-title">已執行的卡牌</div>
            <div className="action-token__popover-cards">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="item-card item-card--image item-card--mini"
                        style={{ backgroundImage: `url(${getItemCardImage(card, geishaSet ?? 'default')})` }}
                    >
                        <div className="item-card__overlay" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="action-token-row mb-3">
            {tokens.map((token, idx) => {
                const cards = usedCards?.[token.type] ?? [];
                const canInspect = token.used && cards.length > 0 && (token.type === 'secret' || token.type === 'trade-off');
                const isOpen = openToken === token.type && canInspect;

                return (
                    <div
                        key={idx}
                        className="action-token-wrapper"
                        onMouseLeave={() => setOpenToken(null)}
                    >
                        <button
                            className={`action-token btn ${token.used ? 'used' : ''}`}
                            disabled={Boolean(disabled) || (token.used && !canInspect)}
                            onClick={() => handleTokenClick(token)}
                            onBlur={() => setOpenToken(null)}
                            type="button"
                        >
                            <img
                                className="action-token__icon"
                                src={actionIconMap[token.type]}
                                alt={token.type}
                            />
                        </button>
                        {isOpen && renderUsedCards(cards)}
                    </div>
                );
            })}
        </div>
    );
};

export default ActionTokens;
