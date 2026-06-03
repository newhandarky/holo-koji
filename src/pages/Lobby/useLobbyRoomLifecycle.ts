import { useEffect } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
    ErrorPayload,
    PlayerJoinedPayload,
    RoomCreatedPayload
} from '@newhandarky/hanakoji-game-types';
import { NavigateFunction } from 'react-router-dom';
import config from '../../config/environment';
import { gameWebSocket } from '../../services/websocket';
import { saveRoomSessionToken } from '../../utils/roomSession';
import { frontendLogger } from '../../utils/runtimeLogger';
import {
    buildErrorPayload,
    InvitedRoom,
    InviteRecoveryNotice,
    resolveInviteRecovery
} from './lobbyInviteFlow';

interface UseLobbyRoomLifecycleOptions {
    navigate: NavigateFunction;
    playerNameRef: MutableRefObject<string>;
    invitedRoomRef: MutableRefObject<InvitedRoom | null>;
    pendingJoinRoomRef: MutableRefObject<string | null>;
    setConnectionStatus: Dispatch<SetStateAction<'disconnected' | 'connecting' | 'connected'>>;
    setInviteRecovery: Dispatch<SetStateAction<InviteRecoveryNotice | null>>;
    setIsConnecting: Dispatch<SetStateAction<boolean>>;
}

export const useLobbyRoomLifecycle = ({
    navigate,
    playerNameRef,
    invitedRoomRef,
    pendingJoinRoomRef,
    setConnectionStatus,
    setInviteRecovery,
    setIsConnecting
}: UseLobbyRoomLifecycleOptions) => {
    useEffect(() => {
        let isActive = true;
        const unsubscribeHandlers: Array<() => void> = [];
        const cleanupLifecycleHandlers = () => {
            while (unsubscribeHandlers.length > 0) {
                unsubscribeHandlers.pop()?.();
            }
        };

        const connectWS = async () => {
            setConnectionStatus('connecting');
            try {
                await gameWebSocket.connect(config.websocketUrl);
                if (!isActive) return;
                setConnectionStatus('connected');
                frontendLogger.info('✅ [Lobby] WebSocket 連線成功');
            } catch (error) {
                if (!isActive) return;
                setConnectionStatus('disconnected');
                frontendLogger.error('❌ [Lobby] WebSocket 連線失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            }
        };

        if (!gameWebSocket.isConnected()) {
            connectWS();
        } else {
            setConnectionStatus('connected');
        }

        const handleRoomCreated = (payload: RoomCreatedPayload) => {
            setIsConnecting(false);
            localStorage.setItem('currentPlayerId', playerNameRef.current);
            saveRoomSessionToken(payload.roomId, payload.playerId ?? playerNameRef.current, payload.roomSessionToken);

            cleanupLifecycleHandlers();
            navigate(`/game/${payload.roomId}`);
        };

        const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
            setIsConnecting(false);
            localStorage.setItem('currentPlayerId', playerNameRef.current);
            saveRoomSessionToken(payload.roomId, payload.playerId ?? playerNameRef.current, payload.roomSessionToken);

            cleanupLifecycleHandlers();
            navigate(`/game/${payload.roomId}`);
        };

        const handleError = (payload: unknown) => {
            const errorPayload: ErrorPayload = buildErrorPayload(payload);
            frontendLogger.error('❌ [Lobby] 伺服器錯誤', {
                message: errorPayload.message,
                code: errorPayload.code
            });
            setIsConnecting(false);
            const pendingJoinRoom = pendingJoinRoomRef.current;
            pendingJoinRoomRef.current = null;
            if (pendingJoinRoom && invitedRoomRef.current?.roomId === pendingJoinRoom) {
                const recovery = resolveInviteRecovery(errorPayload);
                setInviteRecovery({
                    roomId: pendingJoinRoom,
                    reason: recovery.reason,
                    message: recovery.message
                });
                return;
            }

            alert(`錯誤: ${errorPayload.message}`);
        };

        unsubscribeHandlers.push(gameWebSocket.on('ROOM_CREATED', handleRoomCreated));
        unsubscribeHandlers.push(gameWebSocket.on('PLAYER_JOINED', handlePlayerJoined));
        unsubscribeHandlers.push(gameWebSocket.on('ERROR', handleError));

        return () => {
            isActive = false;
            cleanupLifecycleHandlers();
        };
    }, [
        invitedRoomRef,
        navigate,
        pendingJoinRoomRef,
        playerNameRef,
        setConnectionStatus,
        setInviteRecovery,
        setIsConnecting
    ]);
};
