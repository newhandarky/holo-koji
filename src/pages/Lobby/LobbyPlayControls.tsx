import React from 'react';
import { CharacterProfile, GeishaSet, RoomSetupMode } from 'game-shared-types';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';

interface LobbyPlayControlsProps {
    playerName: string;
    roomId: string;
    matchMode: 'online' | 'npc';
    aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'hell';
    selectedGeishaSet: GeishaSet;
    setupMode: RoomSetupMode;
    availableCharacterProfiles: CharacterProfile[];
    selectedCharacterIds: string[];
    customSelectionCount: number;
    isConnecting: boolean;
    canCreateRoom: boolean;
    canJoinRoom: boolean;
    hasUnavailableCharacterSet: boolean;
    accountGuestNotice?: string;
    invitedRoomNotice?: string;
    inviteRecovery?: {
        roomId: string;
        message: string;
    } | null;
    onPlayerNameChange: (value: string) => void;
    onRoomIdChange: (value: string) => void;
    onMatchModeChange: (value: 'online' | 'npc') => void;
    onAiDifficultyChange: (value: 'easy' | 'medium' | 'hard' | 'expert' | 'hell') => void;
    onGeishaSetChange: (value: GeishaSet) => void;
    onSetupModeChange: (value: RoomSetupMode) => void;
    onCharacterSelectionToggle: (characterId: string) => void;
    onCopyInviteRoomId: () => void;
    onClearInviteRecovery: () => void;
    onCreateRoom: () => void;
    onJoinRoom: () => void;
}

const LobbyPlayControls: React.FC<LobbyPlayControlsProps> = ({
    playerName,
    roomId,
    matchMode,
    aiDifficulty,
    selectedGeishaSet,
    setupMode,
    availableCharacterProfiles,
    selectedCharacterIds,
    customSelectionCount,
    isConnecting,
    canCreateRoom,
    canJoinRoom,
    hasUnavailableCharacterSet,
    accountGuestNotice,
    invitedRoomNotice,
    inviteRecovery,
    onPlayerNameChange,
    onRoomIdChange,
    onMatchModeChange,
    onAiDifficultyChange,
    onGeishaSetChange,
    onSetupModeChange,
    onCharacterSelectionToggle,
    onCopyInviteRoomId,
    onClearInviteRecovery,
    onCreateRoom,
    onJoinRoom
}) => (
    <div className="lobby-controls">
        <div className="lobby-controls__heading">
            <div>
                <div className="lobby-controls__kicker">Lobby</div>
                <h2 className="lobby-controls__title">選擇你的入場方式</h2>
            </div>
        </div>

        <div className="lobby-form-block">
            {accountGuestNotice && (
                <div className="lobby-account-notice" role="status">
                    {accountGuestNotice}
                </div>
            )}

            {invitedRoomNotice && (
                <div className="lobby-invite-notice" role="status">
                    {invitedRoomNotice}
                </div>
            )}

            {inviteRecovery && (
                <div className="lobby-invite-recovery" role="alert">
                    <div className="lobby-invite-recovery__message">{inviteRecovery.message}</div>
                    <code className="lobby-invite-recovery__room">{inviteRecovery.roomId}</code>
                    <div className="lobby-invite-recovery__actions">
                        <button type="button" className="btn btn-outline-light btn-sm" onClick={onCopyInviteRoomId}>
                            複製房號
                        </button>
                        <button type="button" className="btn btn-outline-light btn-sm" onClick={onClearInviteRecovery}>
                            回到一般加入
                        </button>
                    </div>
                    <div className="lobby-invite-recovery__hint">可請對方重送邀請，或回到建立/加入房間流程。</div>
                </div>
            )}

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
            <span>透過四種行動收集物品卡，獲得女公關的好感。控制四位以上女公關或累積 11 點魅力值即可獲勝。</span>
        </div>
    </div>
);

export default LobbyPlayControls;
