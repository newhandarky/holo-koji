// src/components/game/GameBoard.tsx
import React, { useMemo, useState } from 'react';
import GeishaCard from './GeishaCard';
import PlayerHand from './PlayerHand';
import ActionTokens from './ActionTokens';
import {
    ItemCard,
    ActionType,
    Geisha,
    GameAction,
    GameState
} from 'game-shared-types';

interface GameBoardProps {
    state: GameState;
    playerId: string;
    onSendAction: (action: GameAction) => void;
    canAct: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ state, playerId, onSendAction, canAct }) => {
    const [selectedCards, setSelectedCards] = useState<ItemCard[]>([]);

    // 利用 memo 減少重複排序或運算
    const currentPlayer = useMemo(() => state.players[state.currentPlayer], [state.players, state.currentPlayer]);
    const myState = useMemo(() => state.players.find((player) => player.id === playerId), [state.players, playerId]);
    const isMyTurn = canAct && currentPlayer?.id === playerId;

    const resetSelection = () => setSelectedCards([]);

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
                const sequencePrompt = window.prompt('請輸入第一組 2 張卡片的順序 (以逗號分隔，範例: 1,3)', '1,2');
                if (!sequencePrompt) {
                    return;
                }
                const firstGroupIndexes = sequencePrompt
                    .split(',')
                    .map((value) => Number(value.trim()) - 1)
                    .filter((value) => !Number.isNaN(value) && value >= 0 && value < selectedIds.length);
                if (firstGroupIndexes.length !== 2) {
                    alert('第一組必須為 2 張卡片');
                    return;
                }
                const firstGroup = firstGroupIndexes.map((index) => selectedIds[index]);
                const secondGroup = selectedIds.filter((_id, index) => !firstGroupIndexes.includes(index));
                if (secondGroup.length !== 2) {
                    alert('第二組必須為 2 張卡片');
                    return;
                }
                onSendAction({
                    type: 'INITIATE_COMPETITION',
                    payload: {
                        playerId,
                        groups: [firstGroup, secondGroup]
                    }
                });
                resetSelection();
                break;
            }
            default:
                alert('未知的行動');
        }
    };

    const handleCardSelect = (cards: ItemCard[]) => {
        setSelectedCards(cards);
    };

    if (!myState) {
        return null;
    }

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-center">
                {state.geishas.map((geisha: Geisha) => (
                    <GeishaCard key={geisha.id} geisha={geisha} />
                ))}
            </div>

            <ActionTokens
                tokens={myState.actionTokens}
                onAction={handleAction}
                disabled={!isMyTurn}
            />

            {!canAct && (
                <div className="alert alert-info py-2 mb-3">等待對手操作中...</div>
            )}

            <PlayerHand
                cards={myState.hand}
                onCardSelect={handleCardSelect}
            />
        </div>
    );
};

export default GameBoard;
