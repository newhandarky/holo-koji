// src/components/game/GameBoard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GeishaCard from './GeishaCard';
import PlayerHand from './PlayerHand';
import ActionTokens from './ActionTokens';
import CompetitionGroupModal from './CompetitionGroupModal';
import {
    ItemCard,
    ActionToken,
    ActionType,
    Geisha,
    GameAction,
    GameState
} from 'game-shared-types';

interface GameBoardProps {
    // 全域遊戲狀態
    state: GameState;
    // 自己的玩家 ID
    playerId: string;
    // 房主 ID（用於陣營顏色）
    hostId: string;
    // 發送行動到伺服器
    onSendAction: (action: GameAction) => void;
    // 是否可操作（輪到自己且無互動阻擋）
    canAct: boolean;
    // 抽牌動畫卡片 ID
    highlightCardId?: string | null;
    // 是否啟用抽牌動畫
    highlightActive?: boolean;
}

// 遊戲主棋盤與行動控制區
const GameBoard: React.FC<GameBoardProps> = ({
    state,
    playerId,
    hostId,
    onSendAction,
    canAct,
    highlightCardId,
    highlightActive
}) => {
    const geishaSet = state.geishaSet ?? 'default';
    const [selectedCards, setSelectedCards] = useState<ItemCard[]>([]);
    const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
    const [competitionCards, setCompetitionCards] = useState<ItemCard[]>([]);

    // 取得當前玩家與自己的狀態
    const currentPlayer = state.players[state.currentPlayer];
    const myState = state.players.find((player) => player.id === playerId);
    const isMyTurn = canAct && currentPlayer?.id === playerId;
    const opponentState = state.players.find((player) => player.id !== playerId) ?? null;

    // 靜態資源基底路徑（支援 GitHub Pages）
    const publicBaseUrl = process.env.PUBLIC_URL ?? '';
    // 行動圖示對照表
    const actionIconMap: Record<ActionToken['type'], string> = {
        secret: `${publicBaseUrl}/images/actions/Secret.png`,
        'trade-off': `${publicBaseUrl}/images/actions/Discard.png`,
        gift: `${publicBaseUrl}/images/actions/Gift.png`,
        competition: `${publicBaseUrl}/images/actions/Competition.png`
    };

    // 重置選牌狀態
    const resetSelection = () => setSelectedCards([]);

    // 當手牌更新或輪次切換時清除選牌狀態（避免選到舊卡）
    useEffect(() => {
        resetSelection();
    }, [myState?.hand.length, isMyTurn]);

    // 建立藝妓對應卡數量的索引表（快速查詢）
    const myCountMap = useMemo(() => {
        const map = new Map<number, number>();
        myState?.playedCards.forEach((card) => {
            map.set(card.geishaId, (map.get(card.geishaId) ?? 0) + 1);
        });
        return map;
    }, [myState?.playedCards]);

    const opponentCountMap = useMemo(() => {
        const map = new Map<number, number>();
        opponentState?.playedCards.forEach((card) => {
            map.set(card.geishaId, (map.get(card.geishaId) ?? 0) + 1);
        });
        return map;
    }, [opponentState?.playedCards]);

    // 依魅力值排序，上排 3/3/4/5，下排 2/2/2
    const { topRow, bottomRow } = useMemo(() => {
        const twoPoints = state.geishas.filter((geisha) => geisha.charmPoints === 2);
        const highPoints = state.geishas
            .filter((geisha) => geisha.charmPoints !== 2)
            .sort((a, b) => a.charmPoints - b.charmPoints);

        return {
            topRow: highPoints,
            bottomRow: twoPoints
        };
    }, [state.geishas]);

    // 依房主判斷自身/對手陣營
    const myCamp = playerId && hostId && playerId === hostId ? 'host' : 'guest';
    const opponentCamp = myCamp === 'host' ? 'guest' : 'host';
    const charmMap = useMemo(() => {
        const map = new Map<number, number>();
        state.geishas.forEach((geisha) => {
            map.set(geisha.id, geisha.charmPoints);
        });
        return map;
    }, [state.geishas]);
    const getCharmByGeishaId = useCallback((geishaId: number) => charmMap.get(geishaId) ?? 0, [charmMap]);

    // 依不同動作類型送出對應行動
    const handleAction = (actionType: ActionType) => {
        if (!isMyTurn || !myState) {
            return;
        }

        const selectedIds = selectedCards.map((card) => card.id);

        switch (actionType) {
            case 'secret': {
                if (selectedIds.length !== 1) {
                    alert('請選擇 1 張卡片作為密約');
                    return;
                }
                onSendAction({
                    type: 'PLAY_SECRET',
                    payload: { playerId, cardId: selectedIds[0] }
                });
                resetSelection();
                break;
            }
            case 'trade-off': {
                if (selectedIds.length !== 2) {
                    alert('請選擇 2 張卡片進行取捨');
                    return;
                }
                onSendAction({
                    type: 'PLAY_TRADE_OFF',
                    payload: { playerId, cardIds: selectedIds }
                });
                resetSelection();
                break;
            }
            case 'gift': {
                if (selectedIds.length !== 3) {
                    alert('請選擇 3 張卡片進行贈予');
                    return;
                }
                onSendAction({
                    type: 'INITIATE_GIFT',
                    payload: { playerId, cardIds: selectedIds }
                });
                resetSelection();
                break;
            }
            case 'competition': {
                if (selectedIds.length !== 4) {
                    alert('請選擇 4 張卡片進行競爭');
                    return;
                }
                setCompetitionCards(selectedCards);
                setIsCompetitionModalOpen(true);
                break;
            }
            default:
                alert('未知的行動');
        }
    };

    // 競爭分組選擇完成後送出行動
    const handleCompetitionConfirm = (groups: string[][]) => {
        onSendAction({
            type: 'INITIATE_COMPETITION',
            payload: {
                playerId,
                groups
            }
        });
        setIsCompetitionModalOpen(false);
        setCompetitionCards([]);
        resetSelection();
    };

    // 關閉競爭分組視窗
    const handleCompetitionClose = () => {
        setIsCompetitionModalOpen(false);
        setCompetitionCards([]);
    };

    // 更新選牌狀態並同步給父層
    const handleCardSelect = useCallback((cards: ItemCard[]) => {
        setSelectedCards(cards);
    }, []);

    if (!myState) {
        return null;
    }

    const renderOpponentActions = () => {
        const tokens = opponentState?.actionTokens ?? [];
        return (
            <div className="opponent-actions-bar">
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
            </div>
        );
    };

    return (
        <div>
            {renderOpponentActions()}
            <div className="geisha-row mt-2">
                {topRow.map((geisha: Geisha) => (
                    <GeishaCard
                        key={geisha.id}
                        geisha={geisha}
                        myCount={myCountMap.get(geisha.id) ?? 0}
                        opponentCount={opponentCountMap.get(geisha.id) ?? 0}
                        currentPlayerId={playerId}
                        hostId={hostId}
                        myCamp={myCamp}
                        opponentCamp={opponentCamp}
                        geishaSet={geishaSet}
                    />
                ))}
            </div>
            <div className="geisha-row geisha-row--bottom mb-4">
                {bottomRow.map((geisha: Geisha) => (
                    <GeishaCard
                        key={geisha.id}
                        geisha={geisha}
                        myCount={myCountMap.get(geisha.id) ?? 0}
                        opponentCount={opponentCountMap.get(geisha.id) ?? 0}
                        currentPlayerId={playerId}
                        hostId={hostId}
                        myCamp={myCamp}
                        opponentCamp={opponentCamp}
                        geishaSet={geishaSet}
                    />
                ))}
            </div>

            <ActionTokens
                tokens={myState.actionTokens}
                onAction={handleAction}
                disabled={!isMyTurn}
                usedCards={{
                    secret: myState.secretCards,
                    'trade-off': myState.discardedCards
                }}
                getCharmByGeishaId={getCharmByGeishaId}
                geishaSet={geishaSet}
            />

            {!canAct && (
                <div className="alert alert-info py-2 mb-3">等待對手操作中...</div>
            )}

            <PlayerHand
                cards={myState.hand}
                onCardSelect={handleCardSelect}
                highlightCardId={highlightCardId}
                highlightActive={highlightActive}
                getCharmByGeishaId={getCharmByGeishaId}
                geishaSet={geishaSet}
            />

            <CompetitionGroupModal
                isOpen={isCompetitionModalOpen}
                cards={competitionCards}
                onSelect={handleCompetitionConfirm}
                onClose={handleCompetitionClose}
                getCharmByGeishaId={getCharmByGeishaId}
                geishaSet={geishaSet}
            />
        </div>
    );
};

export default GameBoard;
