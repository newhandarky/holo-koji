export const ACCOUNT_GUEST_NOTICE = '目前以訪客模式繼續，帳號進度暫時不會保存。';

export const ACCOUNT_SYNC_TIMEOUT_MS = 3000;

export const temporaryPersistenceStatus = {
    mode: 'temporary' as const,
    available: true,
    message: 'Account profiles are temporary in this environment.'
};
