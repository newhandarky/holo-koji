import React from 'react';
import { CharacterProfile } from '@newhandarky/hanakoji-game-types';

interface LobbyCustomCharacterSelectionProps {
    availableCharacterProfiles: CharacterProfile[];
    selectedCharacterIds: string[];
    customSelectionCount: number;
    isConnecting: boolean;
    onCharacterSelectionToggle: (characterId: string) => void;
}

export const LobbyCustomCharacterSelection: React.FC<LobbyCustomCharacterSelectionProps> = ({
    availableCharacterProfiles,
    selectedCharacterIds,
    customSelectionCount,
    isConnecting,
    onCharacterSelectionToggle
}) => (
    <div className="lobby-character-selection">
        <div className="lobby-character-selection__summary" aria-live="polite">
            已選 {customSelectionCount} / 7
            {customSelectionCount === 7 ? '，可以建立房間' : '，請選滿七位'}
        </div>
        <div className="lobby-character-grid">
            {availableCharacterProfiles.map((profile) => {
                const isSelected = selectedCharacterIds.includes(profile.characterId);
                return (
                    <button
                        key={profile.characterId}
                        type="button"
                        className={`lobby-character-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => onCharacterSelectionToggle(profile.characterId)}
                        disabled={isConnecting}
                        aria-pressed={isSelected}
                    >
                        <span
                            className="lobby-character-card__image"
                            style={{ backgroundImage: `url(${profile.imageUrl})` }}
                            aria-hidden="true"
                        />
                        <span className="lobby-character-card__name">{profile.name}</span>
                    </button>
                );
            })}
        </div>
    </div>
);
