import React from 'react';
import { AI_DIFFICULTY_OPTIONS, AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';

type MatchMode = 'online' | 'npc';

interface MatchModeSectionProps {
    matchMode: MatchMode;
    aiDifficulty: AiDifficulty;
    isConnecting: boolean;
    onMatchModeChange: (value: MatchMode) => void;
    onAiDifficultyChange: (value: AiDifficulty) => void;
}

export const LobbyMatchModeSection: React.FC<MatchModeSectionProps> = ({
    matchMode,
    aiDifficulty,
    isConnecting,
    onMatchModeChange,
    onAiDifficultyChange
}) => {
    const normalizedAiDifficulty = normalizeAiDifficulty(aiDifficulty);
    const selectedDifficulty = AI_DIFFICULTY_OPTIONS.find((option) => option.value === normalizedAiDifficulty)
        ?? AI_DIFFICULTY_OPTIONS[0];

    return (
        <>
            <label className="form-label">對戰模式</label>
            <div className="lobby-mode-toggle mb-3" role="radiogroup" aria-label="對戰模式">
                <label className={`lobby-mode-toggle__option ${matchMode === 'online' ? 'is-active' : ''}`}>
                    <input
                        type="radio"
                        className="form-check-input me-2"
                        name="matchMode"
                        value="online"
                        checked={matchMode === 'online'}
                        onChange={() => onMatchModeChange('online')}
                        disabled={isConnecting}
                    />
                    線上玩家
                </label>
                <label className={`lobby-mode-toggle__option ${matchMode === 'npc' ? 'is-active' : ''}`}>
                    <input
                        type="radio"
                        className="form-check-input me-2"
                        name="matchMode"
                        value="npc"
                        checked={matchMode === 'npc'}
                        onChange={() => onMatchModeChange('npc')}
                        disabled={isConnecting}
                    />
                    對戰 NPC
                </label>
            </div>

            {matchMode === 'npc' && (
                <div className="mb-3">
                    <label className="form-label" htmlFor="ai-difficulty-select">AI 難度</label>
                    <select
                        id="ai-difficulty-select"
                        className="form-select"
                        value={normalizedAiDifficulty}
                        onChange={(event) => onAiDifficultyChange(normalizeAiDifficulty(event.target.value))}
                        disabled={isConnecting}
                        aria-label="AI 難度"
                    >
                        {AI_DIFFICULTY_OPTIONS.map((option) => {
                            return (
                                <option key={option.value} value={option.value}>
                                    {option.label} - {option.description}
                                </option>
                            );
                        })}
                    </select>
                    <div className="form-text">{selectedDifficulty.description}</div>
                </div>
            )}
        </>
    );
};
