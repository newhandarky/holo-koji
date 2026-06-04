import {
    buildAccountSyncRequestFromAuthorizationCode,
    buildAccountSyncRequestFromLineIdToken,
    buildAccountSyncRequestFromLineProfile
} from './lineAccountRequests';

describe('lineAccountRequests', () => {
    test('builds public profile sync request without client identity proof', () => {
        const request = buildAccountSyncRequestFromLineProfile({
            userId: 'line-user-1',
            displayName: '銀座玩家',
            pictureUrl: 'https://example.test/avatar.png'
        });

        expect(request).toEqual({
            profile: {
                displayName: '銀座玩家',
                avatarUrl: 'https://example.test/avatar.png'
            }
        });
        expect(request).not.toHaveProperty('lineUserId');
        expect(request).not.toHaveProperty('userId');
        expect(request).not.toHaveProperty('rawProfile');
        expect(request).not.toHaveProperty('token');
    });

    test('builds id token request without client-submitted LINE user id', () => {
        const request = buildAccountSyncRequestFromLineIdToken({
            userId: 'line-user-1',
            displayName: '銀座玩家',
            pictureUrl: 'https://example.test/avatar.png'
        }, 'id-token-1');

        expect(request).toEqual({
            idToken: 'id-token-1',
            profile: {
                displayName: '銀座玩家',
                avatarUrl: 'https://example.test/avatar.png'
            }
        });
        expect(request).not.toHaveProperty('lineUserId');
        expect(request).not.toHaveProperty('verifiedIdentity');
    });

    test('builds authorization code request with redirect uri only', () => {
        expect(buildAccountSyncRequestFromAuthorizationCode(
            'auth-code',
            'https://example.test/?lineCallback=1'
        )).toEqual({
            authorizationCode: 'auth-code',
            redirectUri: 'https://example.test/?lineCallback=1'
        });
    });
});
