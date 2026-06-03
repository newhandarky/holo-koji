import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { AccountSyncResult, AchievementStatusResult } from '@newhandarky/hanakoji-game-types';
import { getVerifiedLineProfile } from '../../utils/lineLiff';
import {
    beginBrowserLineLogin,
    getBoundAccountProfile,
    requestAccountStatus,
    syncLineAccountWithIdToken
} from '../../utils/lineAccount';
import { acknowledgeAchievementUnlocks, requestAchievementStatus } from '../../utils/achievementAccount';
import { frontendLogger } from '../../utils/runtimeLogger';

interface UseLobbyAccountAchievementsOptions {
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    playerNameRef: MutableRefObject<string>;
    setPlayerName: Dispatch<SetStateAction<string>>;
}

export const useLobbyAccountAchievements = ({
    connectionStatus,
    playerNameRef,
    setPlayerName
}: UseLobbyAccountAchievementsOptions) => {
    const [accountSyncResult, setAccountSyncResult] = useState<AccountSyncResult | null>(null);
    const [accountBindingStatus, setAccountBindingStatus] = useState<'idle' | 'binding'>('idle');
    const [achievementStatus, setAchievementStatus] = useState<AchievementStatusResult | null>(null);
    const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
    const boundAccountProfile = useMemo(
        () => accountSyncResult ? getBoundAccountProfile(accountSyncResult) : null,
        [accountSyncResult]
    );
    const accountGuestNotice = accountSyncResult?.status === 'sync-failed' || accountSyncResult?.status === 'unverified'
        ? accountSyncResult.guestNotice
        : undefined;
    const isAccountSyncPending = accountBindingStatus === 'binding';
    const achievementItems = achievementStatus?.items ?? [];
    const achievementNewUnlockCount = achievementStatus?.newUnlockCount ?? 0;
    const achievementMessage = achievementStatus?.message;

    useEffect(() => {
        if (connectionStatus !== 'connected' || isAccountSyncPending) {
            return;
        }

        let isActive = true;
        requestAchievementStatus()
            .then((result) => {
                if (!isActive) return;
                setAchievementStatus(result);
            })
            .catch((error) => {
                if (!isActive) return;
                frontendLogger.warn('⚠️ 成就狀態讀取失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            });

        return () => {
            isActive = false;
        };
    }, [accountSyncResult, connectionStatus, isAccountSyncPending]);

    useEffect(() => {
        if (connectionStatus !== 'connected') {
            return;
        }

        let isActive = true;
        requestAccountStatus()
            .then((result) => {
                if (!isActive || result.status !== 'bound') return;
                setAccountSyncResult(result);
            })
            .catch(() => undefined);

        return () => {
            isActive = false;
        };
    }, [connectionStatus]);

    const openAchievements = () => {
        setIsAchievementPanelOpen((current) => !current);
        if (achievementNewUnlockCount <= 0 || !achievementItems.some((item) => item.isNew)) {
            return;
        }

        acknowledgeAchievementUnlocks({
            achievementIds: achievementItems.filter((item) => item.isNew).map((item) => item.achievementId)
        })
            .then(setAchievementStatus)
            .catch((error) => {
                frontendLogger.warn('⚠️ 成就提示清除失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            });
    };

    const bindLineAccount = async () => {
        if (accountBindingStatus === 'binding' || boundAccountProfile) {
            return;
        }

        setAccountBindingStatus('binding');

        try {
            const verifiedLineProfile = await getVerifiedLineProfile();
            if (!verifiedLineProfile) {
                beginBrowserLineLogin();
                return;
            }

            const result = await syncLineAccountWithIdToken(
                verifiedLineProfile.profile,
                verifiedLineProfile.idToken
            );
            setAccountSyncResult(result);
            if (!playerNameRef.current && result.profile?.displayName) {
                setPlayerName(result.profile.displayName);
            }
        } catch (error) {
            frontendLogger.warn('⚠️ LINE 帳號綁定失敗', {
                error: error instanceof Error ? error.message : 'unknown'
            });
            setAccountSyncResult({
                status: 'sync-failed',
                guestNotice: 'LINE 帳號綁定失敗，請稍後再試。',
                persistenceStatus: {
                    mode: 'temporary',
                    available: true,
                    message: 'Account profiles are temporary in this environment.'
                }
            });
        } finally {
            setAccountBindingStatus('idle');
        }
    };

    return {
        accountBindingStatus,
        accountGuestNotice,
        achievementItems,
        achievementMessage,
        achievementNewUnlockCount,
        achievementStatus,
        bindLineAccount,
        boundAccountProfile,
        isAchievementPanelOpen,
        isAccountSyncPending,
        openAchievements
    };
};
