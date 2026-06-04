import type {
    AchievementStatusResult,
    AchievementSummaryItem,
    LineAccountProfile
} from '@newhandarky/hanakoji-game-types';

interface LobbyHeroAsideProps {
    achievementItems: AchievementSummaryItem[];
    achievementMessage?: string;
    achievementNewUnlockCount: number;
    achievementStatus: AchievementStatusResult | null;
    boundAccountProfile: LineAccountProfile | null;
    accountBindingStatus: 'idle' | 'binding';
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    isAchievementPanelOpen: boolean;
    onOpenAchievements: () => void;
    onBindLineAccount: () => void;
}

const LobbyHeroAside = ({
    achievementItems,
    achievementMessage,
    achievementNewUnlockCount,
    achievementStatus,
    boundAccountProfile,
    accountBindingStatus,
    connectionStatus,
    isAchievementPanelOpen,
    onOpenAchievements,
    onBindLineAccount
}: LobbyHeroAsideProps) => (
    <>
        <section className="lobby-achievements" aria-label="成就">
            <button
                type="button"
                className="lobby-achievements__entry"
                onClick={onOpenAchievements}
                aria-expanded={isAchievementPanelOpen}
            >
                <span>
                    <span className="lobby-achievements__kicker">Achievements</span>
                    <span className="lobby-achievements__title">成就</span>
                </span>
                {achievementNewUnlockCount > 0 && (
                    <span className="lobby-achievements__badge">新解鎖 {achievementNewUnlockCount}</span>
                )}
            </button>

            {isAchievementPanelOpen && (
                <div className="lobby-achievements__panel">
                    {achievementStatus?.status === 'available' && achievementItems.length > 0 ? (
                        <div className="lobby-achievements__list">
                            {achievementItems.map((item) => (
                                <div key={item.achievementId} className={`lobby-achievement-item lobby-achievement-item--${item.state}`}>
                                    <div>
                                        <div className="lobby-achievement-item__title">
                                            {item.title}
                                            {item.isNew && <span className="lobby-achievement-item__new">新</span>}
                                        </div>
                                        <div className="lobby-achievement-item__description">{item.description}</div>
                                    </div>
                                    <div className="lobby-achievement-item__progress">
                                        {item.currentValue} / {item.target}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="lobby-achievements__empty" role="status">
                            {achievementMessage ?? '成就狀態讀取中。'}
                        </div>
                    )}
                </div>
            )}
        </section>

        <section className="lobby-account-card" aria-label="LINE 帳號">
            <div>
                <div className="lobby-account-card__kicker">LINE Account</div>
                <div className="lobby-account-card__title">LINE 帳號</div>
                <div className="lobby-account-card__message">
                    {boundAccountProfile
                        ? `已綁定：${boundAccountProfile.displayName}`
                        : '綁定後可保存成就與對局紀錄。'}
                </div>
            </div>
            {!boundAccountProfile && (
                <button
                    type="button"
                    className="btn btn-outline-light lobby-account-card__button"
                    onClick={onBindLineAccount}
                    disabled={accountBindingStatus === 'binding' || connectionStatus !== 'connected'}
                >
                    {accountBindingStatus === 'binding' ? '綁定中...' : '綁定 LINE 帳號'}
                </button>
            )}
        </section>

        <div className="lobby-copy-note">
            <strong>遊戲說明：</strong>
            <span>透過四種行動收集物品卡，獲得女公關的好感。控制四位以上女公關或累積 11 點魅力值即可獲勝。</span>
        </div>
    </>
);

export default LobbyHeroAside;
