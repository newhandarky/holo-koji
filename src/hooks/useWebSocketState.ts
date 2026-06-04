import { ClientAction, ClientState, GameState } from '@newhandarky/hanakoji-game-types';

// 前端狀態 reducer（保留型別同步，避免直接改變原始狀態）
export const clientReducer = (state: ClientState, action: ClientAction): ClientState => {
    switch (action.type) {
        case 'SYNC_SERVER_STATE':
            return {
                ...state,
                gameState: action.payload,
                isLoading: false,
                error: null
            };
        case 'SET_CONNECTION_STATUS':
            return {
                ...state,
                isConnected: action.payload.isConnected
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload.error,
                isLoading: false
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload.isLoading
            };
        default:
            return state;
    }
};

// 初始的客戶端狀態快照
export const initialClientState: ClientState = {
    gameState: {} as GameState,
    isConnected: false,
    isLoading: true,
    error: null
};

export type SafeClientDispatch = (action: ClientAction) => void;
