import { useEffect, useState } from 'react';
import type { GeishaSet, RoomSetupMode } from '@newhandarky/hanakoji-game-types';
import { getCharacterProfilesForSet } from '../../utils/gameData';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import { isCustomSelectionReady } from './lobbyRoomPayloads';

export const useLobbyCustomSelection = () => {
    const [selectedGeishaSet, setSelectedGeishaSet] = useState<GeishaSet>('default');
    const [setupMode, setSetupMode] = useState<RoomSetupMode>('random');
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

    useEffect(() => {
        if (setupMode !== 'custom') {
            setSelectedCharacterIds([]);
            return;
        }

        const profiles = getCharacterProfilesForSet(selectedGeishaSet);
        setSelectedCharacterIds((currentIds) => {
            if (profiles.length === 7) {
                return profiles.map((profile) => profile.characterId);
            }

            const validIds = new Set(profiles.map((profile) => profile.characterId));
            return currentIds.filter((characterId) => validIds.has(characterId));
        });
    }, [selectedGeishaSet, setupMode]);

    const handleGeishaSetChange = (value: GeishaSet) => {
        setSelectedGeishaSet(value);
    };

    const handleSetupModeChange = (value: RoomSetupMode) => {
        setSetupMode(value);
    };

    const toggleCharacterSelection = (characterId: string) => {
        setSelectedCharacterIds((currentIds) => {
            if (currentIds.includes(characterId)) {
                return currentIds.filter((id) => id !== characterId);
            }
            return [...currentIds, characterId];
        });
    };

    const selectedGeishaSetOption = CHARACTER_SET_OPTIONS.find((option) => option.key === selectedGeishaSet);
    const hasUnavailableCharacterSet = CHARACTER_SET_OPTIONS.some((option) => !option.available);
    const availableCharacterProfiles = getCharacterProfilesForSet(selectedGeishaSet);
    const customSelectionCount = selectedCharacterIds.length;
    const customSelectionIsReady = isCustomSelectionReady(setupMode, selectedCharacterIds);

    return {
        selectedGeishaSet,
        setupMode,
        selectedCharacterIds,
        selectedGeishaSetOption,
        hasUnavailableCharacterSet,
        availableCharacterProfiles,
        customSelectionCount,
        customSelectionIsReady,
        handleGeishaSetChange,
        handleSetupModeChange,
        toggleCharacterSelection
    };
};
