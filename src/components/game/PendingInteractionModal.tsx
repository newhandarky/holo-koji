import React, { useEffect, useState } from 'react';
import { ItemCard, PendingInteraction, GameAction, Player, GeishaSetKey } from 'game-shared-types';
import { getItemCardImage, getGeishaCharmById } from '../../utils/gameData';

interface PendingInteractionModalProps {
    // 互動內容（贈予 / 競爭）
    interaction: PendingInteraction;
    // 自己的玩家 ID
    playerId: string;
    // 回應互動的回呼
    onResolve: (action: GameAction) => void;
    // 當前玩家資料
    players: Player[];
    // 取得魅力值（以伺服器資料為主）
    getCharmByGeishaId?: (geishaId: number) => number;
    // 藝妓組合
    geishaSet?: GeishaSetKey;
    activeMotionKind?: 'gift-result' | 'competition-result' | null;
    prefersReducedMotion?: boolean;
}

const renderCard = (card: ItemCard, getCharmByGeishaId?: (geishaId: number) => number, geishaSet?: GeishaSetKey) => (
    <div
        key={card.id}
        className="item-card item-card--image item-card--mini"
        style={{ backgroundImage: `url(${getItemCardImage(card, geishaSet ?? 'default')})` }}
    >
        <div className="item-card__overlay" />
        <div className="item-card__badge">魅力 {getCharmByGeishaId?.(card.geishaId) ?? getGeishaCharmById(card.geishaId)}</div>
    </div>
);

const PendingInteractionModal: React.FC<PendingInteractionModalProps> = ({
    interaction,
    playerId,
    onResolve,
    players,
    getCharmByGeishaId,
    geishaSet,
    activeMotionKind = null,
    prefersReducedMotion = false
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsCollapsed(false);
    }, [interaction.type]);

    const panelClassName = `bottom-sheet__panel ${isCollapsed ? 'is-collapsed' : ''} ${
        activeMotionKind ? 'bottom-sheet__panel--motion-source' : ''
    } ${
        activeMotionKind && prefersReducedMotion ? 'bottom-sheet__panel--motion-reduced' : ''
    }`;

    const title = interaction.type === 'GIFT_SELECTION'
        ? '對手執行了贈予，請選擇一張物品卡牌'
        : '對手執行了競爭，請選擇一組卡牌';

    const body = interaction.type === 'GIFT_SELECTION'
        ? (
            <>
                <p>對手提供了下列卡片，請挑選 1 張：</p>
                <div className={`gift-selection-grid gift-selection-grid--nowrap ${activeMotionKind === 'gift-result' ? 'gift-selection-grid--motion-source' : ''}`}>
                            {interaction.offeredCards.map((card) => (
                                <button
                                    key={card.id}
                                    className="gift-selection-card"
                                    onClick={() => onResolve({
                                        type: 'RESOLVE_GIFT',
                                        payload: { playerId, chosenCardId: card.id }
                                    })}
                                >
                                    {renderCard(card, getCharmByGeishaId, geishaSet)}
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
                    <div
                        key={index}
                        className={`border rounded p-2 mb-2 ${activeMotionKind === 'competition-result' ? 'interaction-group--motion-source' : ''}`}
                    >
                        <div className="d-flex flex-wrap">
                            {group.map((card) => renderCard(card, getCharmByGeishaId, geishaSet))}
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
            <div className={panelClassName}>
                {
                    !isCollapsed && <div className="bottom-sheet__header">
                        <h5 className="bottom-sheet__title">{title}</h5>
                        <button
                            className="bottom-sheet__toggle"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? '展開' : '收合'}
                        </button>
                    </div>
                }
                {!isCollapsed && (
                    <div className="bottom-sheet__body">
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
