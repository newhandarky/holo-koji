// src/contexts/GameContext.tsx - 完整版本
import React, { createContext, useContext, useReducer } from 'react';
import { GameState, GameAction } from "@newhandarky/hanakoji-game-types"
import { gameReducer, initialState } from "../reducers/gameReducer"

// Context 型別定義（提供全域狀態與派發）
interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
}

// 建立遊戲狀態 Context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider：包住整個應用，提供遊戲狀態
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 使用 reducer 管理全域遊戲狀態
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

// Hook：取得遊戲狀態與 dispatch
export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
