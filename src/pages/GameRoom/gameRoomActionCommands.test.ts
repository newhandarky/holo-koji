import {
    buildGameRoomActionCommand,
    buildGameRoomCompetitionAction,
    buildGameRoomCompetitionResponseAction,
    buildGameRoomGiftResponseAction
} from './gameRoomActionCommands';
import { ItemCard } from '@newhandarky/hanakoji-game-types';

const makeCard = (id: string, geishaId = 1): ItemCard => ({ id, geishaId, type: 'real' });

describe('gameRoomActionCommands', () => {
    test('builds secret action without exposing card details', () => {
        const result = buildGameRoomActionCommand('secret', 'p1', [
            { id: 'card-1', geishaId: 3, itemLabel: 'viewer card' } as ItemCard
        ]);

        expect(result).toEqual({
            kind: 'send',
            action: {
                type: 'PLAY_SECRET',
                payload: { playerId: 'p1', cardId: 'card-1' }
            }
        });
    });

    test('rejects secret action unless exactly one card is selected', () => {
        expect(buildGameRoomActionCommand('secret', 'p1', [])).toEqual({
            kind: 'error',
            message: '請選擇 1 張卡片作為密約'
        });
    });

    test('builds trade-off action with selected card ids only', () => {
        const result = buildGameRoomActionCommand('trade-off', 'p1', [
            makeCard('card-1'),
            makeCard('card-2')
        ]);

        expect(result).toEqual({
            kind: 'send',
            action: {
                type: 'PLAY_TRADE_OFF',
                payload: { playerId: 'p1', cardIds: ['card-1', 'card-2'] }
            }
        });
    });

    test('builds gift action with selected card ids only', () => {
        const result = buildGameRoomActionCommand('gift', 'p1', [
            makeCard('card-1'),
            makeCard('card-2'),
            makeCard('card-3')
        ]);

        expect(result).toEqual({
            kind: 'send',
            action: {
                type: 'INITIATE_GIFT',
                payload: { playerId: 'p1', cardIds: ['card-1', 'card-2', 'card-3'] }
            }
        });
    });

    test('returns competition command with immutable selected card copy', () => {
        const selectedCards = [makeCard('card-1'), makeCard('card-2'), makeCard('card-3'), makeCard('card-4')];
        const result = buildGameRoomActionCommand('competition', 'p1', selectedCards);

        expect(result).toEqual({ kind: 'competition', cards: selectedCards });
        expect(result.kind === 'competition' ? result.cards : []).not.toBe(selectedCards);
    });

    test('rejects competition unless exactly four cards are selected', () => {
        expect(buildGameRoomActionCommand('competition', 'p1', [makeCard('card-1')])).toEqual({
            kind: 'error',
            message: '請選擇 4 張卡片進行競爭'
        });
    });

    test('builds competition initiation action from chosen groups', () => {
        expect(buildGameRoomCompetitionAction('p1', [['card-1', 'card-2'], ['card-3', 'card-4']])).toEqual({
            type: 'INITIATE_COMPETITION',
            payload: {
                playerId: 'p1',
                groups: [['card-1', 'card-2'], ['card-3', 'card-4']]
            }
        });
    });

    test('builds pending gift response from chosen viewer card id', () => {
        expect(buildGameRoomGiftResponseAction('p2', 'offered-card')).toEqual({
            type: 'RESOLVE_GIFT',
            payload: { playerId: 'p2', chosenCardId: 'offered-card' }
        });
    });

    test('builds pending competition response from chosen viewer group index', () => {
        expect(buildGameRoomCompetitionResponseAction('p2', 1)).toEqual({
            type: 'RESOLVE_COMPETITION',
            payload: { playerId: 'p2', chosenGroupIndex: 1 }
        });
    });
});
