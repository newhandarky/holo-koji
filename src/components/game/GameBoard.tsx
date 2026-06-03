// src/components/game/GameBoard.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GeishaCard from './GeishaCard';
import PlayerHand from './PlayerHand';
import ActionTokens from './ActionTokens';
import CompetitionGroupModal from './CompetitionGroupModal';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';
import {
    ItemCard,
    ActionType,
    Geisha,
    GameState,
    GeishaSet
} from '@newhandarky/hanakoji-game-types';
import { ItemIconDefinition, getItemIconDefinitionByPosition } from '../../utils/gameData';
import {
    buildGameRoomActionCommand,
    buildGameRoomCompetitionAction
} from '../../pages/GameRoom/gameRoomActionCommands';
import type { GameAction } from '@newhandarky/hanakoji-game-types';

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
    openingDealSteps?: OpeningDealCueStep[];
    // 是否偏好低動作模式
    prefersReducedMotion?: boolean;
    // 目前房間聚焦區塊
    focusSection: FocusSection;
    openingHandReveal?: OpeningHandRevealModel | null;
    onTakeOpeningHand?: () => void;
}

export type FocusSection = 'info' | 'characterBoard' | 'handActions';

// 遊戲主棋盤與行動控制區
const GameBoard: React.FC<GameBoardProps> = ({
    state,
    playerId,
    onSendAction,
    canAct,
    highlightCardId,
    highlightActive,
    motionCues = [],
    openingDealSteps = [],
    prefersReducedMotion = false,
    focusSection,
    openingHandReveal = null,
    onTakeOpeningHand
}) => {
    const activeGeishaSet: GeishaSet = state.geishaSet ?? 'default';
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
    const isCharacterExpanded = focusSection === 'characterBoard';
    const isHandExpanded = focusSection === 'handActions';
    const isOpeningHandInteractionBlocked = Boolean(openingHandReveal?.isInteractionBlocked);

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

    const geishaItemIconMap = useMemo(() => {
        // 014 clarifications require position-bound icons even when no player owns the item card.
        const map = new Map<number, ItemIconDefinition>();

        orderedGeishas.forEach((geisha, index) => {
            const positionIndex = geisha.boardSlotId ?? index + 1;
            map.set(geisha.id, getItemIconDefinitionByPosition(positionIndex, activeGeishaSet));
        });

        return map;
    }, [orderedGeishas, activeGeishaSet]);

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
        if (!isMyTurn || !myState || isOpeningHandInteractionBlocked) {
            return;
        }

        const command = buildGameRoomActionCommand(actionType, playerId, selectedCards);

        if (command.kind === 'error') {
            alert(command.message);
            return;
        }

        if (command.kind === 'competition') {
            setCompetitionCards(command.cards);
            setIsCompetitionModalOpen(true);
            return;
        }

        onSendAction(command.action);
        resetSelection();
    };

    // 競爭分組選擇完成後送出行動
    const handleCompetitionConfirm = (groups: string[][]) => {
        if (isOpeningHandInteractionBlocked) {
            return;
        }

        onSendAction(buildGameRoomCompetitionAction(playerId, groups));
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
        if (isOpeningHandInteractionBlocked) {
            return;
        }

        setSelectedCards(cards);
    }, [isOpeningHandInteractionBlocked]);

    if (!myState) {
        return null;
    }

    return (
        <div className="game-focus-column">
            <section className={`game-focus-section ${isCharacterExpanded ? 'is-expanded' : 'is-collapsed'}`}>
                {isCharacterExpanded && (
                    <>
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
                                                        isFocused={index === activeGeishaIndex}
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
                    </>
                )}
            </section>

            <section className={`game-focus-section ${isHandExpanded ? 'is-expanded' : 'is-collapsed'}`}>
                {isHandExpanded && (
                    <div className="game-hand-actions-panel">
                        <div className="game-hand-actions-panel__body">
                            {!canAct && !isOpeningHandInteractionBlocked && (
                                <div className="alert alert-info py-2 mb-2">等待對手操作中...</div>
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
                                openingDealSteps={openingDealSteps}
                                openingHandReveal={openingHandReveal}
                                onTakeOpeningHand={onTakeOpeningHand}
                            />
                        </div>
                        <div className="game-hand-actions-panel__footer">
                            <ActionTokens
                                tokens={myState.actionTokens}
                                onAction={handleAction}
                                disabled={!isMyTurn || isOpeningHandInteractionBlocked}
                                usedCards={{
                                    secret: myState.secretCards,
                                    'trade-off': myState.discardedCards
                                }}
                                getCharmByGeishaId={getCharmByGeishaId}
                                geishaSet={activeGeishaSet}
                            />
                        </div>
                    </div>
                )}
            </section>

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
