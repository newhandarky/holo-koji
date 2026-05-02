// src/components/game/GameBoard.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GeishaCard from './GeishaCard';
import PlayerHand from './PlayerHand';
import ActionTokens from './ActionTokens';
import CompetitionGroupModal from './CompetitionGroupModal';
import { MotionCue } from './gameMotion';
import {
    ItemCard,
    ActionToken,
    ActionType,
    Geisha,
    GameAction,
    GameState
} from 'game-shared-types';
import { ItemIconDefinition, getItemIconDefinitionForCard } from '../../utils/gameData';

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
    // 主棋盤目前啟用中的動態提示
    motionCues?: MotionCue[];
    // 是否偏好低動作模式
    prefersReducedMotion?: boolean;
}

// 遊戲主棋盤與行動控制區
const GameBoard: React.FC<GameBoardProps> = ({
    state,
    playerId,
    onSendAction,
    canAct,
    highlightCardId,
    highlightActive,
    motionCues = [],
    prefersReducedMotion = false
}) => {
    const activeGeishaSet: 'default' = 'default';
    const [selectedCards, setSelectedCards] = useState<ItemCard[]>([]);
    const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
    const [competitionCards, setCompetitionCards] = useState<ItemCard[]>([]);
    const [activeGeishaIndex, setActiveGeishaIndex] = useState(0);
    const swipeStateRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);

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

    const boardMotionCues = useMemo(
        () => motionCues.filter((cue) => cue.targetZone === 'board' && typeof cue.targetGeishaId === 'number'),
        [motionCues]
    );
    const handMotionCues = useMemo(
        () => motionCues.filter((cue) => cue.targetZone === 'hand'),
        [motionCues]
    );
    const competitionResultMotionActive = useMemo(
        () => motionCues.some((cue) => cue.kind === 'competition-result'),
        [motionCues]
    );

    const allKnownItemCards = useMemo(() => {
        const cards: ItemCard[] = [];
        const appendCards = (cardGroup: ItemCard[] | undefined | null) => {
            if (cardGroup?.length) {
                cards.push(...cardGroup);
            }
        };

        state.players.forEach((player) => {
            appendCards(player.hand);
            appendCards(player.playedCards);
            appendCards(player.secretCards);
            appendCards(player.discardedCards);
        });

        appendCards(state.drawPile);
        appendCards(state.discardPile);

        if (state.removedCard) {
            cards.push(state.removedCard);
        }

        if (state.pendingInteraction?.type === 'GIFT_SELECTION') {
            appendCards(state.pendingInteraction.offeredCards);
        }

        if (state.pendingInteraction?.type === 'COMPETITION_SELECTION') {
            state.pendingInteraction.groups.forEach((group) => appendCards(group));
        }

        return cards;
    }, [state]);

    const geishaItemIconMap = useMemo(() => {
        const map = new Map<number, ItemIconDefinition>();

        allKnownItemCards.forEach((card) => {
            if (map.has(card.geishaId)) {
                return;
            }

            map.set(card.geishaId, getItemIconDefinitionForCard(card, activeGeishaSet));
        });

        return map;
    }, [allKnownItemCards, activeGeishaSet]);

    const orderedGeishas = useMemo(() => (
        [...state.geishas].sort((left, right) => {
            if (left.charmPoints !== right.charmPoints) {
                return left.charmPoints - right.charmPoints;
            }

            const leftSlotOrder = left.boardSlotId ?? left.id;
            const rightSlotOrder = right.boardSlotId ?? right.id;
            return leftSlotOrder - rightSlotOrder;
        })
    ), [state.geishas]);

    const charmMap = useMemo(() => {
        const map = new Map<number, number>();
        state.geishas.forEach((geisha) => {
            map.set(geisha.id, geisha.charmPoints);
        });
        return map;
    }, [state.geishas]);
    const getCharmByGeishaId = useCallback((geishaId: number) => charmMap.get(geishaId) ?? 0, [charmMap]);

    useEffect(() => {
        setActiveGeishaIndex((currentIndex) => {
            if (orderedGeishas.length === 0) {
                return 0;
            }

            return Math.min(currentIndex, orderedGeishas.length - 1);
        });
    }, [orderedGeishas]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        swipeStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    const releasePointerDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const dragState = swipeStateRef.current;

        if (!dragState || dragState.pointerId !== event.pointerId) {
            return;
        }

        swipeStateRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY)) {
            return;
        }
        if (orderedGeishas.length === 0) {
            return;
        }

        if (deltaX < 0) {
            setActiveGeishaIndex((current) => (current + 1) % orderedGeishas.length);
            return;
        }

        setActiveGeishaIndex((current) => (current - 1 + orderedGeishas.length) % orderedGeishas.length);
    }, [orderedGeishas.length]);

    const handleCoverflowStep = useCallback((direction: 'prev' | 'next') => {
        if (orderedGeishas.length === 0) {
            return;
        }

        const offset = direction === 'prev' ? -1 : 1;
        const total = orderedGeishas.length;
        const nextIndex = (activeGeishaIndex + offset + total) % total;

        setActiveGeishaIndex(nextIndex);
    }, [activeGeishaIndex, orderedGeishas.length]);

    const getCoverflowOffset = useCallback((index: number) => {
        const total = orderedGeishas.length;
        if (total <= 1) {
            return 0;
        }

        let offset = index - activeGeishaIndex;
        if (offset > total / 2) {
            offset -= total;
        } else if (offset < -total / 2) {
            offset += total;
        }
        return offset;
    }, [activeGeishaIndex, orderedGeishas.length]);

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
            <section className="geisha-coverflow mt-2 mb-4" aria-label="人物卡 coverflow">
                <div className="geisha-coverflow__header">
                    <div className="geisha-coverflow__summary">
                        <span className="geisha-coverflow__eyebrow">人物卡</span>
                        <span className="geisha-coverflow__position">
                            {orderedGeishas.length > 0 ? `${activeGeishaIndex + 1} / ${orderedGeishas.length}` : '0 / 0'}
                        </span>
                    </div>
                </div>
                <div className="geisha-coverflow__stage">
                    <button
                        type="button"
                        className="geisha-coverflow__nav geisha-coverflow__nav--prev"
                        onClick={() => handleCoverflowStep('prev')}
                        aria-label="上一張人物卡"
                    >
                        ←
                    </button>
                    <div
                        className="geisha-coverflow__viewport"
                        onPointerDown={handlePointerDown}
                        onPointerUp={releasePointerDrag}
                        onPointerCancel={releasePointerDrag}
                        onPointerLeave={releasePointerDrag}
                    >
                        <div className="geisha-coverflow__track">
                            {orderedGeishas.map((geisha: Geisha, index) => {
                                const offset = getCoverflowOffset(index);
                                const distanceFromActive = Math.abs(offset);

                                return (
                                    <div
                                        key={geisha.id}
                                        className={`geisha-coverflow__slide ${index === activeGeishaIndex ? 'is-active' : ''} ${distanceFromActive === 1 ? 'is-adjacent' : ''} ${distanceFromActive > 2 ? 'is-distant' : ''}`}
                                        aria-current={index === activeGeishaIndex}
                                        style={{
                                            ['--coverflow-offset' as string]: `${offset}`,
                                            ['--coverflow-abs-offset' as string]: `${distanceFromActive}`
                                        }}
                                    >
                                        <GeishaCard
                                            geisha={geisha}
                                            myCount={myCountMap.get(geisha.id) ?? 0}
                                            opponentCount={opponentCountMap.get(geisha.id) ?? 0}
                                            currentPlayerId={playerId}
                                            itemIcon={geishaItemIconMap.get(geisha.id) ?? null}
                                            motionCues={boardMotionCues.filter((cue) => cue.targetGeishaId === geisha.id)}
                                            prefersReducedMotion={prefersReducedMotion}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="geisha-coverflow__nav geisha-coverflow__nav--next"
                        onClick={() => handleCoverflowStep('next')}
                        aria-label="下一張人物卡"
                    >
                        →
                    </button>
                </div>
            </section>

            <ActionTokens
                tokens={myState.actionTokens}
                onAction={handleAction}
                disabled={!isMyTurn}
                usedCards={{
                    secret: myState.secretCards,
                    'trade-off': myState.discardedCards
                }}
                getCharmByGeishaId={getCharmByGeishaId}
                geishaSet={activeGeishaSet}
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
                geishaSet={activeGeishaSet}
                motionCues={handMotionCues}
                prefersReducedMotion={prefersReducedMotion}
            />

            <CompetitionGroupModal
                isOpen={isCompetitionModalOpen}
                cards={competitionCards}
                onSelect={handleCompetitionConfirm}
                onClose={handleCompetitionClose}
                getCharmByGeishaId={getCharmByGeishaId}
                geishaSet={activeGeishaSet}
                showResultMotionHint={competitionResultMotionActive}
                prefersReducedMotion={prefersReducedMotion}
            />
        </div>
    );
};

export default GameBoard;
