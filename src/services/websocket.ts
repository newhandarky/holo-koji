// src/services/websocket.ts - 強化版本
import { frontendLogger, summarizeSocketMessage } from '../utils/runtimeLogger';

// WebSocket 訊息格式
interface WebSocketMessage {
    type: string;
    payload: any;
}

export class GameWebSocket {
    // WebSocket 連線物件
    private ws: WebSocket | null = null;
    // 訊息處理器表（事件名稱 → 處理函式）
    public messageHandlers: Map<string, (payload: any) => void> = new Map();
    // 重新連線計數
    private reconnectAttempts = 0;
    // 重新連線最大次數
    private maxReconnectAttempts = 5;
    // 重新連線延遲基準（毫秒）
    private reconnectDelay = 1000;
    private reconnectTimerId: ReturnType<typeof setTimeout> | null = null;
    private shouldReconnect = false;
    private connectPromise: Promise<void> | null = null;

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
                    const openHandler = this.messageHandlers.get('__OPEN__'); // 通知使用端連線事件
                    if (openHandler) {
                        openHandler(undefined);
                    }
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
                        const message: WebSocketMessage = JSON.parse(event.data);

                        // 查找處理器
                        const handler = this.messageHandlers.get(message.type);

                        if (handler) {
                            handler(message.payload);
                        } else {
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
                    const closeHandler = this.messageHandlers.get('__CLOSE__'); // 通知使用端關閉事件
                    if (closeHandler) {
                        closeHandler({ code: event.code, reason: event.reason });
                    }

                    if (this.shouldReconnect && !event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
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
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    // 發送訊息到伺服器
    send(type: string, payload: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message: WebSocketMessage = { type, payload };
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
    on(messageType: string, handler: (payload: any) => void): void {
        this.messageHandlers.set(messageType, handler);
    }

    // 移除事件處理器
    off(messageType: string): void {
        this.messageHandlers.delete(messageType);
    }

    // 主動關閉連線
    disconnect(): void {
        this.shouldReconnect = false;
        this.clearReconnectTimer();
        this.connectPromise = null;
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
}

// 單例 WebSocket 服務
export const gameWebSocket = new GameWebSocket();
