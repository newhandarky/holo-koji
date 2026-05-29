import { GeishaSet } from '@newhandarky/hanakoji-game-types';

export interface LobbyCharacterSetOption {
    key: GeishaSet;
    displayName: string;
    available: boolean;
    disabledReason?: string;
}

export const CHARACTER_SET_OPTIONS: LobbyCharacterSetOption[] = [
    { key: 'default', displayName: 'Ginza', available: true },
    { key: 'collaboration', displayName: '擅自合作系列', available: true },
    { key: 'hololive', displayName: 'Hololive', available: true }
];
