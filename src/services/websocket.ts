// src/services/websocket.ts - 強化版本
import {
    ClientToServerEventMap,
    ClientToServerEventType,
    ServerToClientEventMap,
    ServerToClientEventType
} from '@newhandarky/hanakoji-game-types';
import { frontendLogger, summarizeSocketMessage } from '../utils/runtimeLogger';
import {
    getReconnectDelayMs,
    resolveAttachedSession,
    shouldAttemptReconnect,
    shouldUpdateAttachedSession,
    type AttachedSession
} from './websocketConnectionRuntime';
import {
    addWebSocketMessageHandler,
    dispatchWebSocketMessage,
    removeWebSocketMessageHandler,
    type MessageHandler
} from './websocketDispatchRuntime';
import { parseWebSocketMessage } from './websocketMessageParser';

type InternalConnectionEvent = '__OPEN__' | '__CLOSE__';
type GameWebSocketEventType = ServerToClientEventType | InternalConnectionEvent;
type GameWebSocketEventPayload<TType extends GameWebSocketEventType> =
    TType extends ServerToClientEventType ? ServerToClientEventMap[TType] : unknown;
type UnsubscribeHandler = () => void;

export class GameWebSocket {
    // WebSocket 連線物件
    private ws: WebSocket | null = null;
    // 訊息處理器表（事件名稱 → 多個處理函式）
    public messageHandlers: Map<string, Set<MessageHandler>> = new Map();
    // 重新連線計數
    private reconnectAttempts = 0;
    // 重新連線最大次數
    private maxReconnectAttempts = 5;
    // 重新連線延遲基準（毫秒）
    private reconnectDelay = 1000;
    private reconnectTimerId: ReturnType<typeof setTimeout> | null = null;
    private shouldReconnect = false;
    private connectPromise: Promise<void> | null = null;
    private attachedSession: AttachedSession | null = null;

    // 建立 WebSocket 連線
    connect(url: string): Promise<void> {
        this.shouldReconnect = true;
        this.clearReconnectTimer();

        if (this.ws?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);

                // 連線成功
                this.ws.onopen = () => {
                    this.connectPromise = null;
                    this.reconnectAttempts = 0;
                    this.dispatchMessage('__OPEN__', undefined); // 通知使用端連線事件
                    resolve();
                };

                // 連線錯誤
                this.ws.onerror = (error) => {
                    this.connectPromise = null;
                    reject(error);
                };

                // 關鍵：訊息接收處理
                this.ws.onmessage = (event) => {
                    try {
                        const message = parseWebSocketMessage(event.data);

                        const handled = this.dispatchMessage(message.type, message.payload);
                        if (!handled) {
                            frontendLogger.warn('⚠️ [WebSocket] 找不到處理器', summarizeSocketMessage(message) ?? undefined);
                        }

                    } catch (error) {
                        frontendLogger.error('❌ [WebSocket] 訊息解析錯誤', {
                            error: error instanceof Error ? error.message : 'unknown'
                        });
                    }
                };

                this.ws.onclose = (event) => {
                    this.connectPromise = null;
                    this.attachedSession = null;
                    this.dispatchMessage('__CLOSE__', { code: event.code, reason: event.reason }); // 通知使用端關閉事件

                    if (shouldAttemptReconnect({
                        shouldReconnect: this.shouldReconnect,
                        wasClean: event.wasClean,
                        reconnectAttempts: this.reconnectAttempts,
                        maxReconnectAttempts: this.maxReconnectAttempts
                    })) {
                        this.attemptReconnect(url);
                    }
                };

            } catch (error) {
                this.connectPromise = null;
                reject(error);
            }
        });

        return this.connectPromise;
    }

    private dispatchMessage(messageType: string, payload: unknown): boolean {
        if (shouldUpdateAttachedSession(messageType)) {
            this.attachedSession = resolveAttachedSession(payload);
        }

        return dispatchWebSocketMessage({
            handlers: this.messageHandlers,
            messageType,
            payload,
            onHandlerError: (type, error) => {
                frontendLogger.error('❌ [WebSocket] 處理器執行失敗', {
                    type,
                    error: error instanceof Error ? error.message : 'unknown'
                });
            }
        });
    }

    private clearReconnectTimer() {
        if (this.reconnectTimerId) {
            clearTimeout(this.reconnectTimerId);
            this.reconnectTimerId = null;
        }
    }

    // 嘗試重新連線
    private attemptReconnect(url: string) {
        if (!this.shouldReconnect) {
            return;
        }

        this.reconnectAttempts++;

        this.clearReconnectTimer();
        this.reconnectTimerId = setTimeout(() => {
            this.reconnectTimerId = null;
            if (!this.shouldReconnect) {
                return;
            }

            this.connect(url).catch(() => {
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    frontendLogger.error('❌ [WebSocket] 重連失敗，已達最大重試次數', {
                        attempts: this.reconnectAttempts
                    });
                }
            });
        }, getReconnectDelayMs(this.reconnectDelay, this.reconnectAttempts));
    }

    // 發送訊息到伺服器
    send<TType extends ClientToServerEventType>(type: TType, payload: ClientToServerEventMap[TType]): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = { type, payload };
            this.ws.send(JSON.stringify(message));
            frontendLogger.diagnostic('🐞 [WebSocket] 傳送事件摘要', summarizeSocketMessage(message) ?? undefined);
        } else {
            frontendLogger.error('❌ [WebSocket] 無法發送訊息', {
                type,
                connectionState: this.getConnectionState()
            });
            throw new Error('WebSocket 連線不可用');
        }
    }

    // 註冊事件處理器
    on<TType extends GameWebSocketEventType>(
        messageType: TType,
        handler: (payload: GameWebSocketEventPayload<TType>) => void
    ): UnsubscribeHandler {
        const normalizedHandler = handler as MessageHandler;
        addWebSocketMessageHandler(this.messageHandlers, messageType, normalizedHandler);

        return () => {
            this.off(messageType, handler);
        };
    }

    // 移除事件處理器
    off<TType extends GameWebSocketEventType>(
        messageType: TType,
        handler?: (payload: GameWebSocketEventPayload<TType>) => void
    ): void {
        if (!handler) {
            removeWebSocketMessageHandler(this.messageHandlers, messageType);
            return;
        }

        removeWebSocketMessageHandler(this.messageHandlers, messageType, handler as MessageHandler);
    }

    // 主動關閉連線
    disconnect(): void {
        this.shouldReconnect = false;
        this.clearReconnectTimer();
        this.connectPromise = null;
        this.attachedSession = null;
        if (this.ws) {
            this.ws.close(1000, '正常關閉');
            this.ws = null;
        }
    }

    // 取得目前連線狀態
    getConnectionState(): string {
        if (!this.ws) return 'CLOSED';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }

    // 是否已連線
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    getAttachedSession(): AttachedSession | null {
        return this.attachedSession;
    }
}

// 單例 WebSocket 服務
export const gameWebSocket = new GameWebSocket();
