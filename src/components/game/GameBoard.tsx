// src/components/game/GameBoard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
    buildGameRoomActionCommand,
    buildGameRoomCompetitionAction
} from '../../pages/GameRoom/gameRoomActionCommands';
import type { GameAction } from '@newhandarky/hanakoji-game-types';
import {
    buildCharmLookup,
    buildGeishaItemIconMap,
    buildPlayedCardCountMap,
    buildPlayerBoardContext,
    partitionBoardMotionCues,
    sortGeishasForBoard
} from './gameBoardModel';
import { useGeishaCoverflow } from './useGeishaCoverflow';

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

    // 取得當前玩家與自己的狀態
    const isCharacterExpanded = focusSection === 'characterBoard';
    const isHandExpanded = focusSection === 'handActions';
    const {
        myState,
        opponentState,
        isMyTurn,
        isOpeningHandInteractionBlocked
    } = buildPlayerBoardContext(
        state,
        playerId,
        canAct,
        Boolean(openingHandReveal?.isInteractionBlocked)
    );

    // 重置選牌狀態
    const resetSelection = () => setSelectedCards([]);

    // 當手牌更新或輪次切換時清除選牌狀態（避免選到舊卡）
    useEffect(() => {
        resetSelection();
    }, [myState?.hand.length, isMyTurn]);

    // 建立藝妓對應卡數量的索引表（快速查詢）
    const myCountMap = useMemo(() => {
        return buildPlayedCardCountMap(myState?.playedCards);
    }, [myState?.playedCards]);

    const opponentCountMap = useMemo(() => {
        return buildPlayedCardCountMap(opponentState?.playedCards);
    }, [opponentState?.playedCards]);

    const {
        boardMotionCues,
        handMotionCues,
        competitionResultMotionActive
    } = useMemo(() => partitionBoardMotionCues(motionCues), [motionCues]);

    const orderedGeishas = useMemo(() => sortGeishasForBoard(state.geishas), [state.geishas]);

    const geishaItemIconMap = useMemo(() => {
        return buildGeishaItemIconMap(orderedGeishas, activeGeishaSet);
    }, [orderedGeishas, activeGeishaSet]);

    const getCharmByGeishaId = useMemo(() => buildCharmLookup(state.geishas), [state.geishas]);
    const {
        activeGeishaIndex,
        handleCoverflowStep,
        handlePointerDown,
        releasePointerDrag,
        getCoverflowOffset
    } = useGeishaCoverflow(orderedGeishas.length);

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
