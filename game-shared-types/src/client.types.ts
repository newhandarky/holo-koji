// shared-types/src/client.types.ts

import { GameState } from './game.types';

// 前端 React Reducer 的 Action 型別 (dispatch 用的)
export type ClientAction =
    | { type: 'SYNC_SERVER_STATE'; payload: GameState }
    | { type: 'SET_CONNECTION_STATUS'; payload: { isConnected: boolean } }
    | { type: 'SET_ERROR'; payload: { error: string } }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_LOADING'; payload: { isLoading: boolean } };

// 前端狀態
export interface ClientState {
    gameState: GameState;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
}
