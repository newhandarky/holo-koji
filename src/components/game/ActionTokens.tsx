// src/components/game/ActionTokens.tsx
import React, { useState } from 'react';
import { ActionToken, ItemCard } from "game-shared-types"
import { getGeishaCardImageById, getGeishaCharmById } from '../../utils/gameData';

/**
 * ActionTokens 組件：顯示並觸發行動標誌
 */
interface Props {
    tokens: ActionToken[];                            // 可用行動標誌
    onAction: (type: ActionToken['type']) => void;    // 點擊行動回呼
    disabled?: boolean;                               // 是否暫時停用
    usedCards?: Partial<Record<ActionToken['type'], ItemCard[]>>; // 已使用行動的卡牌資訊
}

// 靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';
// 行動圖示對照表
const actionIconMap: Record<ActionToken['type'], string> = {
    secret: `${publicBaseUrl}/images/actions/Secret.png`,
    'trade-off': `${publicBaseUrl}/images/actions/Discard.png`,
    gift: `${publicBaseUrl}/images/actions/Gift.png`,
    competition: `${publicBaseUrl}/images/actions/Competition.png`
};

const ActionTokens: React.FC<Props> = ({ tokens, onAction, disabled, usedCards }) => {
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
                        style={{ backgroundImage: `url(${getGeishaCardImageById(card.geishaId)})` }}
                    >
                        <div className="item-card__overlay" />
                        <div className="item-card__badge">魅力 {getGeishaCharmById(card.geishaId)}</div>
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
                    <button
                        key={idx}
                        className={`action-token btn me-2 mb-2 ${token.used ? 'used' : ''}`}
                        disabled={Boolean(disabled) || (token.used && !canInspect)}
                        onClick={() => handleTokenClick(token)}
                        onBlur={() => setOpenToken(null)}
                    >
                        <img
                            className="action-token__icon"
                            src={actionIconMap[token.type]}
                            alt={token.type}
                        />
                        {isOpen && renderUsedCards(cards)}
                    </button>
                );
            })}
        </div>
    );
};

export default ActionTokens;
