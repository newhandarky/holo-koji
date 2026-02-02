import 'game-shared-types';

declare module 'game-shared-types' {
    export interface GameState {
        geishaSet?: 'default' | 'akatsuki';
    }
}
