import {
    ClientAction,
    GameAction as GameContextAction,
    ReadyStatusPayload,
    ServerToClientEventMap,
    ServerToClientEventType
} from '@newhandarky/hanakoji-game-types';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { clearRoomSessionToken } from '../utils/roomSession';
import {
    CardDrawEvent,
    DealAnimationEvent,
    cardDrawEvent,
    dealAnimationEvent,
    normalizeErrorPayload,
    orderConfirmationUpdate,
    orderDecisionPlayers,
    orderDecisionResult,
    readyStatusPayload,
    roundCompletePayload
} from './webSocketPayloads';
import { appendRuntimeEvent } from './webSocketEventQueue';

export const PLAYER_ID_TAKEN_ERROR = '這個房間的重連憑證已失效，請返回大廳重新加入或更換名稱。';

type SafeClientDispatch = Dispatch<ClientAction>;

interface WebSocketRuntimeHandlerOptions {
    gameId: string;
    playerId: string;
    gameDispatchRef: MutableRefObject<Dispatch<GameContextAction>>;
    safeDispatch: SafeClientDispatch;
    syncGameState: (payload: unknown) => void;
    setDrawQueue: Dispatch<SetStateAction<CardDrawEvent[]>>;
    setDealQueue: Dispatch<SetStateAction<DealAnimationEvent[]>>;
    setRoundSummary: Dispatch<SetStateAction<{ round: number } | null>>;
    roundSummaryTimerRef: MutableRefObject<number | null>;
    setReadyStatus: Dispatch<SetStateAction<ReadyStatusPayload | null>>;
}

export interface WebSocketRuntimeHandlers {
    syncGameState: (payload: unknown) => void;
    handleOrderDecisionStart: (payload: unknown) => void;
    handleOrderDecisionResult: (payload: unknown) => void;
    handleOrderConfirmationUpdate: (payload: unknown) => void;
    handleErrorMessage: (payload: unknown) => void;
    handleCardDrawn: (payload: unknown) => void;
    handleDealAnimation: (payload: unknown) => void;
    handleRoundComplete: (payload: unknown) => void;
    handleReadyCheck: (payload: unknown) => void;
    handleReadyStatus: (payload: unknown) => void;
    ignoreLifecycleEvent: () => void;
}

export const createWebSocketRuntimeHandlers = ({
    gameId,
    playerId,
    gameDispatchRef,
    safeDispatch,
    syncGameState,
    setDrawQueue,
    setDealQueue,
    setRoundSummary,
    roundSummaryTimerRef,
    setReadyStatus
}: WebSocketRuntimeHandlerOptions): WebSocketRuntimeHandlers => {
    const handleOrderDecisionStart = (payload: unknown) => {
        const players = orderDecisionPlayers(payload);
        if (players.length === 0) {
            return;
        }

        gameDispatchRef.current({ type: 'START_ORDER_DECISION', payload: { players } });
    };

    const handleOrderDecisionResult = (payload: unknown) => {
        const resultPayload = orderDecisionResult(payload);
        if (!resultPayload) {
            return;
        }

        gameDispatchRef.current({
            type: 'ORDER_DECISION_RESULT',
            payload: {
                firstPlayer: resultPayload.firstPlayer,
                secondPlayer: resultPayload.secondPlayer,
                order: resultPayload.order
            }
        });

        if (resultPayload.gameState) {
            syncGameState(resultPayload.gameState);
        }
    };

    const handleOrderConfirmationUpdate = (payload: unknown) => {
        const update = orderConfirmationUpdate(payload);
        if (!update) {
            return;
        }

        gameDispatchRef.current({
            type: 'UPDATE_ORDER_CONFIRMATIONS',
            payload: update
        });
    };

    const handleErrorMessage = (payload: unknown) => {
        const errorPayload = normalizeErrorPayload(payload);
        if (errorPayload.code === 'PLAYER_ID_TAKEN') {
            clearRoomSessionToken(gameId, playerId);
            safeDispatch({ type: 'SET_ERROR', payload: { error: PLAYER_ID_TAKEN_ERROR } });
            return;
        }
        safeDispatch({ type: 'SET_ERROR', payload: { error: errorPayload.message } });
    };

    const handleCardDrawn = (payload: unknown) => {
        const drawEvent = cardDrawEvent(payload);
        setDrawQueue((previous) => appendRuntimeEvent(previous, drawEvent));
    };

    const handleDealAnimation = (payload: unknown) => {
        const dealEvent = dealAnimationEvent(payload);
        setDealQueue((previous) => appendRuntimeEvent(previous, dealEvent));
    };

    const handleRoundComplete = (payload: unknown) => {
        const roundPayload = roundCompletePayload(payload);
        if (!roundPayload) {
            return;
        }

        setRoundSummary({ round: roundPayload.round! });

        if (roundSummaryTimerRef.current) {
            window.clearTimeout(roundSummaryTimerRef.current);
        }

        roundSummaryTimerRef.current = window.setTimeout(() => {
            setRoundSummary(null);
        }, 2500);
    };

    const handleReadyCheck = (payload: unknown) => {
        const candidate = readyStatusPayload(payload);
        if (candidate) {
            setReadyStatus(candidate);
        }
    };

    const handleReadyStatus = (payload: unknown) => {
        const candidate = readyStatusPayload(payload);
        if (!candidate) {
            return;
        }
        if (candidate.waitingFor.length === 0) {
            setReadyStatus(null);
        } else {
            setReadyStatus(candidate);
        }
    };

    const ignoreLifecycleEvent = () => {
        // 這些事件目前只作為 server 廣播輔助，不需要額外前端處理；
        // 明確註冊 no-op handler，避免正常流程被記成「找不到處理器」警告。
    };

    return {
        syncGameState,
        handleOrderDecisionStart,
        handleOrderDecisionResult,
        handleOrderConfirmationUpdate,
        handleErrorMessage,
        handleCardDrawn,
        handleDealAnimation,
        handleRoundComplete,
        handleReadyCheck,
        handleReadyStatus,
        ignoreLifecycleEvent
    };
};

type RegisterEventHandler = <TType extends ServerToClientEventType>(
    eventType: TType,
    handler: (payload: ServerToClientEventMap[TType]) => void
) => void;

export const registerWebSocketRuntimeHandlers = (
    registerEventHandler: RegisterEventHandler,
    handlers: WebSocketRuntimeHandlers
) => {
    registerEventHandler('GAME_STATE_UPDATE', handlers.syncGameState);
    registerEventHandler('GAME_STATE_UPDATED', handlers.syncGameState);
    registerEventHandler('GAME_STATE_SYNC', handlers.syncGameState);
    registerEventHandler('STATE_CHANGED', handlers.syncGameState);
    registerEventHandler('GAME_STARTED', handlers.syncGameState);
    registerEventHandler('READY_CHECK', handlers.handleReadyCheck);
    registerEventHandler('READY_STATUS', handlers.handleReadyStatus);
    registerEventHandler('ROUND_COMPLETE', handlers.handleRoundComplete);
    registerEventHandler('ORDER_DECISION_START', handlers.handleOrderDecisionStart);
    registerEventHandler('ORDER_DECISION_STARTED', handlers.handleOrderDecisionStart);
    registerEventHandler('ORDER_DECISION_RESULT', handlers.handleOrderDecisionResult);
    registerEventHandler('ORDER_DECISION_COMPLETED', handlers.handleOrderDecisionResult);
    registerEventHandler('ORDER_CONFIRMATION_UPDATE', handlers.handleOrderConfirmationUpdate);
    registerEventHandler('ORDER_CONFIRMATIONS_UPDATED', handlers.handleOrderConfirmationUpdate);
    registerEventHandler('ERROR', handlers.handleErrorMessage);
    registerEventHandler('GAME_ENDED', handlers.syncGameState);
    registerEventHandler('CARD_DRAWN', handlers.handleCardDrawn);
    registerEventHandler('DEAL_ANIMATION', handlers.handleDealAnimation);
    registerEventHandler('ACTION_EXECUTED', handlers.ignoreLifecycleEvent);
};
