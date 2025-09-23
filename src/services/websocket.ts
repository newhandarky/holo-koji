// src/services/websocket.ts - 強化版本
interface WebSocketMessage {
    type: string;
    payload: any;
}

export class GameWebSocket {
    private ws: WebSocket | null = null;
    public messageHandlers: Map<string, (payload: any) => void> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log('🟢 [WebSocket] 連線建立成功');
                    this.reconnectAttempts = 0;
                    const openHandler = this.messageHandlers.get('__OPEN__'); // 通知使用端連線事件
                    if (openHandler) {
                        openHandler(undefined);
                    }
                    resolve();
                };

                this.ws.onerror = (error) => {
                    console.error('🔴 [WebSocket] 連線錯誤:', error);
                    reject(error);
                };

                // 關鍵：訊息接收處理
                this.ws.onmessage = (event) => {
                    try {
                        console.log('📨 [WebSocket] ===== 收到原始資料 =====');
                        console.log('📨 [WebSocket] 資料內容:', event.data);

                        const message: WebSocketMessage = JSON.parse(event.data);

                        console.log('📨 [WebSocket] ===== 解析後的訊息 =====');
                        console.log('📨 [WebSocket] 訊息類型:', message.type);
                        console.log('📨 [WebSocket] 訊息內容:', message.payload);
                        console.log('📨 [WebSocket] 完整訊息物件:', message);

                        // 特別檢查 GAME_STARTED 事件
                        if (message.type === 'GAME_STARTED') {
                            console.log('🚨 [WebSocket] ===== 重要：GAME_STARTED 事件 =====');
                            console.log('🚨 [WebSocket] gameId:', message.payload?.gameId);
                            console.log('🚨 [WebSocket] players 數量:', message.payload?.players?.length);
                            console.log('🚨 [WebSocket] players 內容:', message.payload?.players);
                            console.log('🚨 [WebSocket] phase:', message.payload?.phase);
                        }

                        // 查找處理器
                        const handler = this.messageHandlers.get(message.type);
                        console.log('🔍 [WebSocket] 查找處理器結果:', {
                            messageType: message.type,
                            handlerExists: !!handler,
                            registeredHandlers: Array.from(this.messageHandlers.keys())
                        });

                        if (handler) {
                            console.log(`✅ [WebSocket] 執行處理器: ${message.type}`);
                            handler(message.payload);
                            console.log(`✅ [WebSocket] 處理器執行完成: ${message.type}`);
                        } else {
                            console.warn('⚠️ [WebSocket] 找不到處理器:', message.type);
                            console.warn('⚠️ [WebSocket] 已註冊的處理器:', Array.from(this.messageHandlers.keys()));
                        }

                    } catch (error) {
                        console.error('❌ [WebSocket] 訊息解析錯誤:', error);
                        console.error('❌ [WebSocket] 原始資料:', event.data);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('🔴 [WebSocket] 連線關閉:', event.code, event.reason);

                    const closeHandler = this.messageHandlers.get('__CLOSE__'); // 通知使用端關閉事件
                    if (closeHandler) {
                        closeHandler({ code: event.code, reason: event.reason });
                    }

                    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.attemptReconnect(url);
                    }
                };

            } catch (error) {
                console.error('❌ [WebSocket] 建立失敗:', error);
                reject(error);
            }
        });
    }

    private attemptReconnect(url: string) {
        this.reconnectAttempts++;
        console.log(`🔄 [WebSocket] 嘗試重新連線 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect(url).catch(() => {
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('❌ [WebSocket] 重連失敗，已達最大重試次數');
                }
            });
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    send(type: string, payload: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message: WebSocketMessage = { type, payload };
            console.log('📤 [WebSocket] 發送訊息:', message);
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('❌ [WebSocket] 無法發送訊息，連線狀態:', this.getConnectionState());
            throw new Error('WebSocket 連線不可用');
        }
    }

    on(messageType: string, handler: (payload: any) => void): void {
        console.log(`📋 [WebSocket] 註冊處理器: ${messageType}`);
        this.messageHandlers.set(messageType, handler);
        console.log(`📋 [WebSocket] 目前已註冊:`, Array.from(this.messageHandlers.keys()));
    }

    off(messageType: string): void {
        const removed = this.messageHandlers.delete(messageType);
        console.log(`🗑️ [WebSocket] 移除處理器: ${messageType} - ${removed ? '成功' : '失敗'}`);
    }

    disconnect(): void {
        if (this.ws) {
            console.log('🔌 [WebSocket] 主動關閉連線');
            this.ws.close(1000, '正常關閉');
            this.ws = null;
        }
    }

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

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const gameWebSocket = new GameWebSocket();
