import {
    consumeLineLoginCallback,
    getLineLoginCallbackUrl
} from './lineBrowserLogin';

describe('lineBrowserLogin', () => {
    beforeEach(() => {
        jest.useRealTimers();
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.history.pushState({}, '', '/');
    });

    test('builds callback url using holo-koji base path when present', () => {
        window.history.pushState({}, '', '/holo-koji/lobby');

        expect(getLineLoginCallbackUrl()).toBe('http://localhost/holo-koji/?lineCallback=1');
    });

    test('accepts matching state from localStorage fallback and clears stored flow', () => {
        window.localStorage.setItem('hanamikoji-line-login-flow', JSON.stringify({
            state: 'saved-state',
            redirectUri: 'https://example.test/?lineCallback=1',
            createdAt: Date.now()
        }));
        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=saved-state');

        expect(consumeLineLoginCallback()).toEqual({
            authorizationCode: 'auth-code',
            redirectUri: 'https://example.test/?lineCallback=1'
        });
        expect(window.localStorage.getItem('hanamikoji-line-login-flow')).toBeNull();
    });

    test('rejects expired localStorage fallback state and clears stored flow', () => {
        window.localStorage.setItem('hanamikoji-line-login-flow', JSON.stringify({
            state: 'saved-state',
            redirectUri: 'https://example.test/?lineCallback=1',
            createdAt: Date.now() - (11 * 60 * 1000)
        }));
        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=saved-state');

        expect(consumeLineLoginCallback()).toBeNull();
        expect(window.localStorage.getItem('hanamikoji-line-login-flow')).toBeNull();
    });

    test('rejects mismatched state and missing code', () => {
        window.sessionStorage.setItem('hanamikoji-line-login-state', 'saved-state');
        window.sessionStorage.setItem('hanamikoji-line-login-redirect-uri', 'https://example.test/?lineCallback=1');

        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=other-state');
        expect(consumeLineLoginCallback()).toBeNull();
        expect(window.sessionStorage.getItem('hanamikoji-line-login-state')).toBeNull();

        window.sessionStorage.setItem('hanamikoji-line-login-state', 'saved-state');
        window.sessionStorage.setItem('hanamikoji-line-login-redirect-uri', 'https://example.test/?lineCallback=1');
        window.history.pushState({}, '', '/?lineCallback=1&state=saved-state');
        expect(consumeLineLoginCallback()).toBeNull();
        expect(window.sessionStorage.getItem('hanamikoji-line-login-state')).toBeNull();
    });
});
