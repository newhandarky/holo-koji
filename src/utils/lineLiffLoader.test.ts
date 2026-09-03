import { __resetLiffSdkLoaderForTests, loadLiffSdk } from './lineLiffLoader';

const getLiffScript = () => document.getElementById('line-liff-sdk') as HTMLScriptElement | null;

describe('lineLiffLoader', () => {
    beforeEach(() => {
        delete window.liff;
        __resetLiffSdkLoaderForTests();
    });

    afterEach(() => {
        delete window.liff;
        __resetLiffSdkLoaderForTests();
    });

    test('loads the LIFF SDK successfully on explicit request', async () => {
        const loading = loadLiffSdk();
        const script = getLiffScript();

        expect(script).not.toBeNull();
        expect(script?.src).toBe('https://static.line-scdn.net/liff/edge/2/sdk.js');
        expect(script?.async).toBe(true);

        window.liff = {};
        script?.dispatchEvent(new Event('load'));

        await expect(loading).resolves.toBeUndefined();
        expect(document.querySelectorAll('#line-liff-sdk')).toHaveLength(1);
    });

    test('deduplicates concurrent load requests within the page lifecycle', async () => {
        const first = loadLiffSdk();
        const second = loadLiffSdk();

        expect(second).toBe(first);
        expect(document.querySelectorAll('#line-liff-sdk')).toHaveLength(1);

        window.liff = {};
        getLiffScript()?.dispatchEvent(new Event('load'));

        await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);
    });

    test('removes a failed request and allows the next explicit call to retry', async () => {
        const first = loadLiffSdk();
        const firstScript = getLiffScript();
        firstScript?.dispatchEvent(new Event('error'));

        await expect(first).rejects.toThrow('LIFF SDK 載入失敗');
        expect(getLiffScript()).toBeNull();

        const retry = loadLiffSdk();
        const retryScript = getLiffScript();

        expect(retryScript).not.toBe(firstScript);
        window.liff = {};
        retryScript?.dispatchEvent(new Event('load'));

        await expect(retry).resolves.toBeUndefined();
    });

    test('reuses an already available SDK without creating a script', async () => {
        window.liff = {};

        await expect(loadLiffSdk()).resolves.toBeUndefined();
        expect(getLiffScript()).toBeNull();
    });
});
