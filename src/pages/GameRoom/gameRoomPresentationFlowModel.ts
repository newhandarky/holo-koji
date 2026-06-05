export interface GameRoomPresentationFlowInput {
    isOrderDecisionOpen: boolean;
    readyStatus: unknown | null;
    isOpeningDealActive: boolean;
    isOpeningHandRevealBlocking: boolean;
    roundSummary: unknown | null;
}

export const isGameRoomPresentationFlowActive = ({
    isOrderDecisionOpen,
    readyStatus,
    isOpeningDealActive,
    isOpeningHandRevealBlocking,
    roundSummary
}: GameRoomPresentationFlowInput): boolean => Boolean(
    isOrderDecisionOpen
    || readyStatus
    || isOpeningDealActive
    || isOpeningHandRevealBlocking
    || roundSummary
);
