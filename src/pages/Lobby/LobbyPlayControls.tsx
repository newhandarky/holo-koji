import React from 'react';
import { GeishaSet } from 'game-shared-types';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';

interface LobbyPlayControlsProps {
    playerName: string;
    roomId: string;
    matchMode: 'online' | 'npc';
    aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'hell';
    selectedGeishaSet: GeishaSet;
    isConnecting: boolean;
    canCreateRoom: boolean;
    canJoinRoom: boolean;
    hasUnavailableCharacterSet: boolean;
    onPlayerNameChange: (value: string) => void;
    onRoomIdChange: (value: string) => void;
    onMatchModeChange: (value: 'online' | 'npc') => void;
    onAiDifficultyChange: (value: 'easy' | 'medium' | 'hard' | 'expert' | 'hell') => void;
    onGeishaSetChange: (value: GeishaSet) => void;
    onCreateRoom: () => void;
    onJoinRoom: () => void;
}

const LobbyPlayControls: React.FC<LobbyPlayControlsProps> = ({
    playerName,
    roomId,
    matchMode,
    aiDifficulty,
    selectedGeishaSet,
    isConnecting,
    canCreateRoom,
    canJoinRoom,
    hasUnavailableCharacterSet,
    onPlayerNameChange,
    onRoomIdChange,
    onMatchModeChange,
    onAiDifficultyChange,
    onGeishaSetChange,
    onCreateRoom,
    onJoinRoom
}) => (
    <div className="lobby-controls">
        <div className="lobby-controls__heading">
            <div>
                <div className="lobby-controls__kicker">Lobby</div>
                <h2 className="lobby-controls__title">選擇你的入場方式</h2>
            </div>
            <p className="lobby-controls__hint">保留原有流程，只把第一印象換成更像銀座夜色的入口。</p>
        </div>

        <div className="lobby-form-block">
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
                    <label className="form-label">AI 強度</label>
                    <select
                        className="form-select"
                        value={aiDifficulty}
                        onChange={(event) => onAiDifficultyChange(event.target.value as 'easy' | 'medium' | 'hard' | 'expert' | 'hell')}
                        disabled={isConnecting}
                    >
                        <option value="easy">しぐれうい</option>
                        <option value="medium">大空スバル</option>
                        <option value="hard">兎田ぺこら</option>
                        <option value="expert">猫又おかゆ</option>
                        <option value="hell">ときのそら</option>
                    </select>
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">藝妓組合</label>
                <select
                    className="form-select"
                    value={selectedGeishaSet}
                    onChange={(event) => onGeishaSetChange(event.target.value as GeishaSet)}
                    disabled={isConnecting}
                    aria-label="藝妓組合"
                >
                    {CHARACTER_SET_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key} disabled={!option.available}>
                            {option.available ? option.displayName : `${option.displayName}（目前不可用）`}
                        </option>
                    ))}
                </select>
                {hasUnavailableCharacterSet && (
                    <div className="form-text">不可用的藝妓組合會保留顯示，但目前無法建立房間。</div>
                )}
            </div>

            <label className="form-label">玩家名稱</label>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="輸入你的名稱"
                value={playerName}
                onChange={(event) => onPlayerNameChange(event.target.value)}
                disabled={isConnecting}
                maxLength={20}
            />
            <button className="btn btn-primary w-100 lobby-primary-button" onClick={onCreateRoom} disabled={!canCreateRoom}>
                {isConnecting ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        建立中...
                    </>
                ) : '🏠 建立房間'}
            </button>
        </div>

        {matchMode === 'online' && (
            <div className="lobby-form-block lobby-form-block--secondary">
                <label className="form-label">加入房間</label>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="輸入房間代碼"
                    value={roomId}
                    onChange={(event) => onRoomIdChange(event.target.value.toUpperCase())}
                    disabled={isConnecting}
                    maxLength={6}
                />
                <button
                    className="btn btn-outline-light w-100 lobby-secondary-button"
                    onClick={onJoinRoom}
                    disabled={!canJoinRoom}
                >
                    {isConnecting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            加入中...
                        </>
                    ) : '🚪 加入房間'}
                </button>
            </div>
        )}

        <div className="lobby-copy-note">
            <strong>遊戲說明：</strong>
            <span>透過四種行動收集物品卡，獲得藝妓的好感。控制四位以上藝妓或累積 11 點魅力值即可獲勝。</span>
        </div>
    </div>
);

export default LobbyPlayControls;
