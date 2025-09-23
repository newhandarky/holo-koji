// src/contexts/GameContext.tsx - 完整版本
import React, { createContext, useContext, useReducer } from 'react';
import { GameState, GameAction } from "game-shared-types"
import { gameReducer, initialState } from "../reducers/gameReducer"

// Context
interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

// Hook
export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};