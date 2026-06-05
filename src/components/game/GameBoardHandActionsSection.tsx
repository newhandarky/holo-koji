import React from 'react';
import {
    ActionType,
    GeishaSet,
    ItemCard,
    Player
} from '@newhandarky/hanakoji-game-types';
import ActionTokens from './ActionTokens';
import PlayerHand from './PlayerHand';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';

interface GameBoardHandActionsSectionProps {
    isExpanded: boolean;
    canAct: boolean;
    isMyTurn: boolean;
    isOpeningHandInteractionBlocked: boolean;
    myState: Player;
    highlightCardId?: string | null;
    highlightActive?: boolean;
    getCharmByGeishaId: (geishaId: number) => number;
    activeGeishaSet: GeishaSet;
    handMotionCues: MotionCue[];
    prefersReducedMotion: boolean;
    openingDealSteps: OpeningDealCueStep[];
    openingHandReveal: OpeningHandRevealModel | null;
    onTakeOpeningHand?: () => void;
    onCardSelect: (cards: ItemCard[]) => void;
    onAction: (actionType: ActionType) => void;
}

export const GameBoardHandActionsSection: React.FC<GameBoardHandActionsSectionProps> = ({
    isExpanded,
    canAct,
    isMyTurn,
    isOpeningHandInteractionBlocked,
    myState,
    highlightCardId,
    highlightActive,
    getCharmByGeishaId,
    activeGeishaSet,
    handMotionCues,
    prefersReducedMotion,
    openingDealSteps,
    openingHandReveal,
    onTakeOpeningHand,
    onCardSelect,
    onAction
}) => (
    <section className={`game-focus-section ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
        {isExpanded && (
            <div className="game-hand-actions-panel">
                <div className="game-hand-actions-panel__body">
                    {!canAct && !isOpeningHandInteractionBlocked && (
                        <div className="alert alert-info py-2 mb-2">等待對手操作中...</div>
                    )}

                    <PlayerHand
                        cards={myState.hand}
                        onCardSelect={onCardSelect}
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
                        onAction={onAction}
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
);
