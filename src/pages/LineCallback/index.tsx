import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccountSyncResult } from '@newhandarky/hanakoji-game-types';
import config from '../../config/environment';
import { gameWebSocket } from '../../services/websocket';
import {
    consumeLineLoginCallback,
    syncLineAccountWithAuthorizationCode
} from '../../utils/lineAccount';
import { frontendLogger } from '../../utils/runtimeLogger';
import { getLineCallbackOutcome } from './lineCallbackFlow';

let activeCallbackBinding: { search: string; promise: Promise<AccountSyncResult> } | null = null;

interface LineCallbackPageProps {
    onReturnToLobby?: () => void;
}

const LineCallbackPage: React.FC<LineCallbackPageProps> = ({ onReturnToLobby }) => {
    const [message, setMessage] = useState('正在綁定 LINE 帳號...');
    const isMountedRef = useRef(false);
    const bindingStartedRef = useRef(false);
    const activeEffectRunRef = useRef<symbol | null>(null);
    const returnToLobby = useCallback(() => {
        if (onReturnToLobby) {
            onReturnToLobby();
            return;
        }

        const lobbyPath = window.location.pathname.includes('/holo-koji') ? '/holo-koji/' : '/';
        window.location.replace(`${window.location.origin}${lobbyPath}`);
    }, [onReturnToLobby]);

    useEffect(() => {
        const effectRunId = Symbol('line-callback-effect');
        activeEffectRunRef.current = effectRunId;
        isMountedRef.current = true;
        const isCurrentEffectRun = () => isMountedRef.current && activeEffectRunRef.current === effectRunId;

        const bindLineAccount = async () => {
            try {
                const callbackSearch = window.location.search;
                if (bindingStartedRef.current && activeCallbackBinding?.search !== callbackSearch) {
                    return;
                }
                if (!activeCallbackBinding || activeCallbackBinding.search !== callbackSearch) {
                    bindingStartedRef.current = true;
                    const callback = consumeLineLoginCallback();
                    if (!callback) {
                        setMessage('LINE 登入狀態無效，請回到大廳重新綁定。');
                        return;
                    }

                    activeCallbackBinding = {
                        search: callbackSearch,
                        promise: (async () => {
                            if (!gameWebSocket.isConnected()) {
                                await gameWebSocket.connect(config.websocketUrl);
                            }

                            return syncLineAccountWithAuthorizationCode(
                                callback.authorizationCode,
                                callback.redirectUri
                            );
                        })()
                    };
                }

                const result = await activeCallbackBinding.promise;

                if (!isCurrentEffectRun()) return;

                const outcome = getLineCallbackOutcome(result);
                setMessage(outcome.message);
                if (outcome.shouldReturnToLobby) {
                    window.setTimeout(returnToLobby, 700);
                }
            } catch (error) {
                frontendLogger.warn('⚠️ LINE callback binding failed', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
                if (!isCurrentEffectRun()) return;
                setMessage('LINE 帳號綁定失敗，請回到大廳重試。');
            }
        };

        bindLineAccount();

        return () => {
            isMountedRef.current = false;
            if (activeEffectRunRef.current === effectRunId) {
                activeEffectRunRef.current = null;
            }
        };
    }, [returnToLobby]);

    return (
        <div className="lobby-background">
            <div className="line-callback-shell" role="status">
                <div className="line-callback-shell__kicker">LINE</div>
                <h1 className="line-callback-shell__title">帳號綁定</h1>
                <p className="line-callback-shell__message">{message}</p>
                <button type="button" className="btn btn-outline-light" onClick={returnToLobby}>
                    回到大廳
                </button>
            </div>
        </div>
    );
};

export default LineCallbackPage;
