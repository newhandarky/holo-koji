// src/components/game/GameBoard.tsx
import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import GeishaCard from './GeishaCard';
import PlayerHand from './PlayerHand';
import ActionTokens from './ActionTokens';
import { ItemCard, ActionType } from '../../types/game.types';

/**
 * GameBoard 組件：主遊戲介面
 * 顯示藝妓、手牌與行動按鈕
 */
const GameBoard: React.FC = () => {
    const { state, dispatch } = useGame();
    const [selectedCards, setSelectedCards] = useState<ItemCard[]>([]);

    // 處理行動按鈕點擊
    const handleAction = (actionType: ActionType) => {
        // 避免未選卡或狀態不對
        if (!selectedCards.length || state.phase !== 'playing') return;

        dispatch({
            type: 'PLAY_ACTION',
            payload: {
                playerId: state.players[state.currentPlayer].id,
                action: { type: actionType, used: false },
                cards: selectedCards
            }
        });
        setSelectedCards([]);
        dispatch({ type: 'END_TURN' }); // 自動結束回合
    };

    // 手牌選擇回呼
    const handleCardSelect = (cards: ItemCard[]) => {
        setSelectedCards(cards);
    };

    // 如果遊戲尚未初始化
    if (state.players.length < 2) {
        return null;
    }

    const currentPlayer = state.players[state.currentPlayer];

    return (
        <div>
            {/* 藝妓區域 */}
            <div className="d-flex flex-wrap justify-content-center">
                {state.geishas.map(geisha => (
                    <GeishaCard key={geisha.id} geisha={geisha} />
                ))}
            </div>

            {/* 行動標誌 */}
            <ActionTokens
                tokens={currentPlayer.actionTokens}
                onAction={handleAction}
            />

            {/* 玩家手牌 */}
            <PlayerHand
                cards={currentPlayer.hand}
                onCardSelect={handleCardSelect}
            />
        </div>
    );
};

export default GameBoard;