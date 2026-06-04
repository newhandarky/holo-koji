import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { getInviteRoomIdFromLocation } from '../../utils/lineLiff';
import type { InvitedRoom } from './lobbyInviteFlow';

interface UseLobbyInviteBootstrapOptions {
    setRoomId: Dispatch<SetStateAction<string>>;
    setMatchMode: Dispatch<SetStateAction<'online' | 'npc'>>;
    setInvitedRoom: Dispatch<SetStateAction<InvitedRoom | null>>;
    setPlayerName: Dispatch<SetStateAction<string>>;
}

export const useLobbyInviteBootstrap = ({
    setRoomId,
    setMatchMode,
    setInvitedRoom,
    setPlayerName
}: UseLobbyInviteBootstrapOptions) => {
    useEffect(() => {
        const { roomId: invitedRoomId, source } = getInviteRoomIdFromLocation();
        if (!invitedRoomId) return;

        const normalizedRoomId = invitedRoomId.toUpperCase();
        setRoomId(normalizedRoomId);
        setMatchMode('online');
        setInvitedRoom({ roomId: normalizedRoomId, source: source === 'liff' ? 'liff' : 'query' });
        const previousPlayerId = localStorage.getItem('currentPlayerId')?.trim();
        if (previousPlayerId) {
            setPlayerName(previousPlayerId);
        }

        if (source === 'liff') {
            const nextParams = new URLSearchParams(window.location.search);
            nextParams.set('roomId', normalizedRoomId);
            nextParams.delete('liff.state');
            const nextUrl = `${window.location.pathname}?${nextParams.toString()}`;
            window.history.replaceState(null, '', nextUrl);
        }
    }, [setInvitedRoom, setMatchMode, setPlayerName, setRoomId]);
};
