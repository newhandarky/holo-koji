import { GameState } from './game.types';
export type ClientAction = {
    type: 'SYNC_SERVER_STATE';
    payload: GameState;
} | {
    type: 'SET_CONNECTION_STATUS';
    payload: {
        isConnected: boolean;
    };
} | {
    type: 'SET_ERROR';
    payload: {
        error: string;
    };
} | {
    type: 'CLEAR_ERROR';
} | {
    type: 'SET_LOADING';
    payload: {
        isLoading: boolean;
    };
};
export interface ClientState {
    gameState: GameState;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
}
