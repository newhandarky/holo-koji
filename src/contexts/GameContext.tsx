import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction } from '../types/game.types';
import { gameReducer, initialGameState } from '../reducers/gameReducer';

/*
 * Context 類型定義
 * 包含遊戲狀態和 dispatch 函數
 */
interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
}

/*
 * 分離的 Context - 遊戲狀態
 * 避免不必要的重新渲染
 */
const GameStateContext = createContext<GameState | undefined>(undefined);

/*
 * 分離的 Context - dispatch 函數
 * 優化性能，只有需要 dispatch 的組件才會重新渲染
 */
const GameDispatchContext = createContext<React.Dispatch<GameAction> | undefined>(undefined);

/*
 * Provider 組件的 Props 介面
 */
interface GameProviderProps {
    children: ReactNode;
}

/*
 * Game Provider 組件
 * 提供遊戲狀態管理給整個應用
 */
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    // 使用 useReducer 管理遊戲狀態
    const [state, dispatch] = useReducer(gameReducer, initialGameState);

    return (
        <GameStateContext.Provider value={state}>
            <GameDispatchContext.Provider value={dispatch}>
                {children}
            </GameDispatchContext.Provider>
        </GameStateContext.Provider>
    );
};

/*
 * 自定義 Hook：獲取遊戲狀態
 * 只有需要讀取狀態的組件使用
 */
export const useGameState = (): GameState => {
    const context = useContext(GameStateContext);
    if (context === undefined) {
        throw new Error('useGameState 必須在 GameProvider 內使用');
    }
    return context;
};

/*
 * 自定義 Hook：獲取 dispatch 函數
 * 只有需要更新狀態的組件使用
 */
export const useGameDispatch = (): React.Dispatch<GameAction> => {
    const context = useContext(GameDispatchContext);
    if (context === undefined) {
        throw new Error('useGameDispatch 必須在 GameProvider 內使用');
    }
    return context;
};

/*
 * 合併的便利 Hook
 * 同時需要狀態和 dispatch 的組件使用
 */
export const useGame = () => {
    return {
        state: useGameState(),
        dispatch: useGameDispatch(),
    };
};