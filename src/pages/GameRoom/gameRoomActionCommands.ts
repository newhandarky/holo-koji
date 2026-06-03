import { ActionType, GameAction, ItemCard } from '@newhandarky/hanakoji-game-types';

type ActiveActionCommand =
    | { kind: 'send'; action: GameAction }
    | { kind: 'competition'; cards: ItemCard[] }
    | { kind: 'error'; message: string };

const getSelectedCardIds = (selectedCards: ItemCard[]) => selectedCards.map((card) => card.id);

export const buildGameRoomActionCommand = (
    actionType: ActionType,
    playerId: string,
    selectedCards: ItemCard[]
): ActiveActionCommand => {
    const selectedIds = getSelectedCardIds(selectedCards);

    switch (actionType) {
        case 'secret':
            if (selectedIds.length !== 1) {
                return { kind: 'error', message: '請選擇 1 張卡片作為密約' };
            }
            return {
                kind: 'send',
                action: {
                    type: 'PLAY_SECRET',
                    payload: { playerId, cardId: selectedIds[0] }
                }
            };
        case 'trade-off':
            if (selectedIds.length !== 2) {
                return { kind: 'error', message: '請選擇 2 張卡片進行取捨' };
            }
            return {
                kind: 'send',
                action: {
                    type: 'PLAY_TRADE_OFF',
                    payload: { playerId, cardIds: selectedIds }
                }
            };
        case 'gift':
            if (selectedIds.length !== 3) {
                return { kind: 'error', message: '請選擇 3 張卡片進行贈予' };
            }
            return {
                kind: 'send',
                action: {
                    type: 'INITIATE_GIFT',
                    payload: { playerId, cardIds: selectedIds }
                }
            };
        case 'competition':
            if (selectedIds.length !== 4) {
                return { kind: 'error', message: '請選擇 4 張卡片進行競爭' };
            }
            return { kind: 'competition', cards: [...selectedCards] };
        default:
            return { kind: 'error', message: '未知的行動' };
    }
};

export const buildGameRoomCompetitionAction = (playerId: string, groups: string[][]): GameAction => ({
    type: 'INITIATE_COMPETITION',
    payload: { playerId, groups }
});

export const buildGameRoomGiftResponseAction = (playerId: string, chosenCardId: string): GameAction => ({
    type: 'RESOLVE_GIFT',
    payload: { playerId, chosenCardId }
});

export const buildGameRoomCompetitionResponseAction = (playerId: string, chosenGroupIndex: number): GameAction => ({
    type: 'RESOLVE_COMPETITION',
    payload: { playerId, chosenGroupIndex }
});
