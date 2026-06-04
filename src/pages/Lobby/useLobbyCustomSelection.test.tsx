import { act, renderHook } from '@testing-library/react';
import { useLobbyCustomSelection } from './useLobbyCustomSelection';

describe('useLobbyCustomSelection', () => {
    test('starts with random default set and no custom selections', () => {
        const { result } = renderHook(() => useLobbyCustomSelection());

        expect(result.current.selectedGeishaSet).toBe('default');
        expect(result.current.setupMode).toBe('random');
        expect(result.current.selectedCharacterIds).toEqual([]);
        expect(result.current.customSelectionIsReady).toBe(true);
    });

    test('custom setup preselects seven characters for a full set', () => {
        const { result } = renderHook(() => useLobbyCustomSelection());

        act(() => {
            result.current.handleSetupModeChange('custom');
        });

        expect(result.current.selectedCharacterIds).toHaveLength(7);
        expect(result.current.customSelectionCount).toBe(7);
        expect(result.current.customSelectionIsReady).toBe(true);
    });

    test('toggle selection and random mode reset selection', () => {
        const { result } = renderHook(() => useLobbyCustomSelection());

        act(() => {
            result.current.handleSetupModeChange('custom');
        });
        const firstCharacterId = result.current.selectedCharacterIds[0];

        act(() => {
            result.current.toggleCharacterSelection(firstCharacterId);
        });

        expect(result.current.selectedCharacterIds).not.toContain(firstCharacterId);
        expect(result.current.customSelectionIsReady).toBe(false);

        act(() => {
            result.current.handleSetupModeChange('random');
        });

        expect(result.current.selectedCharacterIds).toEqual([]);
        expect(result.current.customSelectionIsReady).toBe(true);
    });

    test('switching geisha set keeps custom selection valid for the new set', () => {
        const { result } = renderHook(() => useLobbyCustomSelection());

        act(() => {
            result.current.handleSetupModeChange('custom');
        });
        act(() => {
            result.current.handleGeishaSetChange('hololive');
        });

        const validCharacterIds = new Set(result.current.availableCharacterProfiles.map((profile) => profile.characterId));
        expect(result.current.selectedCharacterIds).toHaveLength(7);
        expect(result.current.selectedCharacterIds.every((characterId) => validCharacterIds.has(characterId))).toBe(true);
    });
});
