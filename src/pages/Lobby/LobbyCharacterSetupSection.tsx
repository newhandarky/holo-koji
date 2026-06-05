import React from 'react';
import { CharacterProfile, GeishaSet, RoomSetupMode } from '@newhandarky/hanakoji-game-types';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import { LobbyCustomCharacterSelection } from './LobbyCustomCharacterSelection';

interface CharacterSetupSectionProps {
    selectedGeishaSet: GeishaSet;
    setupMode: RoomSetupMode;
    availableCharacterProfiles: CharacterProfile[];
    selectedCharacterIds: string[];
    customSelectionCount: number;
    isConnecting: boolean;
    hasUnavailableCharacterSet: boolean;
    onGeishaSetChange: (value: GeishaSet) => void;
    onSetupModeChange: (value: RoomSetupMode) => void;
    onCharacterSelectionToggle: (characterId: string) => void;
}

export const LobbyCharacterSetupSection: React.FC<CharacterSetupSectionProps> = ({
    selectedGeishaSet,
    setupMode,
    availableCharacterProfiles,
    selectedCharacterIds,
    customSelectionCount,
    isConnecting,
    hasUnavailableCharacterSet,
    onGeishaSetChange,
    onSetupModeChange,
    onCharacterSelectionToggle
}) => (
    <>
        <div className="mb-3">
            <label className="form-label">女公關組合</label>
            <select
                className="form-select"
                value={selectedGeishaSet}
                onChange={(event) => onGeishaSetChange(event.target.value as GeishaSet)}
                disabled={isConnecting}
                aria-label="女公關組合"
            >
                {CHARACTER_SET_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key} disabled={!option.available}>
                        {option.available ? option.displayName : `${option.displayName}（目前不可用）`}
                    </option>
                ))}
            </select>
            {hasUnavailableCharacterSet && (
                <div className="form-text">不可用的女公關組合會保留顯示，但目前無法建立房間。</div>
            )}
        </div>

        <div className="mb-3">
            <label className="form-label">角色設定</label>
            <div className="lobby-mode-toggle mb-2" role="radiogroup" aria-label="角色設定">
                <label className={`lobby-mode-toggle__option ${setupMode === 'random' ? 'is-active' : ''}`}>
                    <input
                        type="radio"
                        className="form-check-input me-2"
                        name="setupMode"
                        value="random"
                        checked={setupMode === 'random'}
                        onChange={() => onSetupModeChange('random')}
                        disabled={isConnecting}
                    />
                    隨機
                </label>
                <label className={`lobby-mode-toggle__option ${setupMode === 'custom' ? 'is-active' : ''}`}>
                    <input
                        type="radio"
                        className="form-check-input me-2"
                        name="setupMode"
                        value="custom"
                        checked={setupMode === 'custom'}
                        onChange={() => onSetupModeChange('custom')}
                        disabled={isConnecting}
                    />
                    自選七位
                </label>
            </div>

            {setupMode === 'custom' && (
                <LobbyCustomCharacterSelection
                    availableCharacterProfiles={availableCharacterProfiles}
                    selectedCharacterIds={selectedCharacterIds}
                    customSelectionCount={customSelectionCount}
                    isConnecting={isConnecting}
                    onCharacterSelectionToggle={onCharacterSelectionToggle}
                />
            )}
        </div>
    </>
);
