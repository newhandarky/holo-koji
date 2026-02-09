import 'game-shared-types';

declare module 'game-shared-types' {
    export type GeishaSetKey = 'default' | 'akatsuki' | 'onesan' | 'collaboration';

    export interface GameState {
        geishaSet?: GeishaSetKey;
    }

    export interface Player {
        lineUserId?: string;
        avatarUrl?: string;
    }
}
