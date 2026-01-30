import React, { useEffect, useState } from 'react';
import { ItemCard, PendingInteraction, GameAction, Player, ActionToken } from 'game-shared-types';
import { getGeishaCardImageById, getGeishaCharmById } from '../../utils/gameData';

interface PendingInteractionModalProps {
    // 互動內容（贈予 / 競爭）
    interaction: PendingInteraction;
    // 自己的玩家 ID
    playerId: string;
    // 回應互動的回呼
    onResolve: (action: GameAction) => void;
    // 當前玩家資料
    players: Player[];
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

// 靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';
// 行動圖示對照表
const actionIconMap: Record<ActionToken['type'], string> = {
    secret: `${publicBaseUrl}/images/actions/Secret.png`,
    'trade-off': `${publicBaseUrl}/images/actions/Discard.png`,
    gift: `${publicBaseUrl}/images/actions/Gift.png`,
    competition: `${publicBaseUrl}/images/actions/Competition.png`
};

const PendingInteractionModal: React.FC<PendingInteractionModalProps> = ({ interaction, playerId, onResolve, players }) => {
    const currentPlayer = players.find(player => player.id === playerId);
    const opponentPlayer = players.find(player => player.id !== playerId);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsCollapsed(false);
    }, [interaction.type]);

    const renderOpponentActions = () => {
        const tokens = opponentPlayer?.actionTokens ?? [];
        return (
            <div className="interaction-opponent-actions">
                {tokens.map((token, index) => (
                    <div key={`${token.type}-${index}`} className="interaction-action-item">
                        <img
                            className={`interaction-action-icon ${token.used ? 'is-used' : ''}`}
                            src={actionIconMap[token.type]}
                            alt={token.type}
                        />
                    </div>
                ))}
            </div>
        );
    };
    const title = interaction.type === 'GIFT_SELECTION'
        ? '對手執行了贈予，請選擇一張物品卡牌'
        : '對手執行了競爭，請選擇一組卡牌';

    const body = interaction.type === 'GIFT_SELECTION'
        ? (
            <>
                <p>對手提供了下列卡片，請挑選 1 張：</p>
                <div className="gift-selection-grid gift-selection-grid--nowrap">
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
            </>
        )
        : (
            <>
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
            </>
        );

    return (
        <div className="bottom-sheet">
            <div className="bottom-sheet__backdrop" />
            <div className={`bottom-sheet__panel ${isCollapsed ? 'is-collapsed' : ''}`}>
                <div className="bottom-sheet__header">
                    <h5 className="bottom-sheet__title">{title}</h5>
                    <button
                        className="bottom-sheet__toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? '展開' : '收合'}
                    </button>
                </div>
                {!isCollapsed && (
                    <div className="bottom-sheet__body">
                        <div className="interaction-header mb-3">
                            <div className="interaction-header__line">
                                對手剩餘手牌：{opponentPlayer?.hand?.length ?? 0}
                            </div>
                            {renderOpponentActions()}
                        </div>
                        {body}
                    </div>
                )}
                {isCollapsed && (
                    <button
                        className="bottom-sheet__expand"
                        onClick={() => setIsCollapsed(false)}
                    >
                        展開操作
                    </button>
                )}
            </div>
        </div>
    );
};

export default PendingInteractionModal;
