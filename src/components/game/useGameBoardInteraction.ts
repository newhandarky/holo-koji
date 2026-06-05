import { useCallback, useEffect, useState } from 'react';
import {
    ActionType,
    GameAction,
    ItemCard,
    Player
} from '@newhandarky/hanakoji-game-types';
import {
    buildGameRoomActionCommand,
    buildGameRoomCompetitionAction
} from '../../pages/GameRoom/gameRoomActionCommands';

interface UseGameBoardInteractionOptions {
    playerId: string;
    myState?: Player | null;
    isMyTurn: boolean;
    isOpeningHandInteractionBlocked: boolean;
    onSendAction: (action: GameAction) => void;
}

export const useGameBoardInteraction = ({
    playerId,
    myState,
    isMyTurn,
    isOpeningHandInteractionBlocked,
    onSendAction
}: UseGameBoardInteractionOptions) => {
    const [selectedCards, setSelectedCards] = useState<ItemCard[]>([]);
    const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
    const [competitionCards, setCompetitionCards] = useState<ItemCard[]>([]);

    const resetSelection = useCallback(() => {
        setSelectedCards([]);
    }, []);

    useEffect(() => {
        resetSelection();
    }, [myState?.hand.length, isMyTurn, resetSelection]);

    const handleAction = useCallback((actionType: ActionType) => {
        if (!isMyTurn || !myState || isOpeningHandInteractionBlocked) {
            return;
        }

        const command = buildGameRoomActionCommand(actionType, playerId, selectedCards);

        if (command.kind === 'error') {
            alert(command.message);
            return;
        }

        if (command.kind === 'competition') {
            setCompetitionCards(command.cards);
            setIsCompetitionModalOpen(true);
            return;
        }

        onSendAction(command.action);
        resetSelection();
    }, [isMyTurn, myState, isOpeningHandInteractionBlocked, playerId, selectedCards, onSendAction, resetSelection]);

    const handleCompetitionConfirm = useCallback((groups: string[][]) => {
        if (isOpeningHandInteractionBlocked) {
            return;
        }

        onSendAction(buildGameRoomCompetitionAction(playerId, groups));
        setIsCompetitionModalOpen(false);
        setCompetitionCards([]);
        resetSelection();
    }, [isOpeningHandInteractionBlocked, onSendAction, playerId, resetSelection]);

    const handleCompetitionClose = useCallback(() => {
        setIsCompetitionModalOpen(false);
        setCompetitionCards([]);
    }, []);

    const handleCardSelect = useCallback((cards: ItemCard[]) => {
        if (isOpeningHandInteractionBlocked) {
            return;
        }

        setSelectedCards(cards);
    }, [isOpeningHandInteractionBlocked]);

    return {
        isCompetitionModalOpen,
        competitionCards,
        handleAction,
        handleCompetitionConfirm,
        handleCompetitionClose,
        handleCardSelect
    };
};
