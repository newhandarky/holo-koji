// src/components/game/ActionTokens.tsx
import React from 'react';
import { ActionToken } from "game-shared-types"

/**
 * ActionTokens 組件：顯示並觸發行動標誌
 */
interface Props {
    tokens: ActionToken[];                            // 可用行動標誌
    onAction: (type: ActionToken['type']) => void;    // 點擊行動回呼
    disabled?: boolean;                               // 是否暫時停用
}

// 靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';
// 行動圖示對照表
const actionIconMap: Record<ActionToken['type'], string> = {
    secret: `${publicBaseUrl}/images/actions/Secret.png`,
    'trade-off': `${publicBaseUrl}/images/actions/Discard.png`,
    gift: `${publicBaseUrl}/images/actions/Gift.png`,
    competition: `${publicBaseUrl}/images/actions/Competition.png`
};

const ActionTokens: React.FC<Props> = ({ tokens, onAction, disabled }) => {
    return (
        <div className="action-token-row mb-3">
            {tokens.map((token, idx) => (
                <button
                    key={idx}
                    className={`action-token btn me-2 mb-2 ${token.used ? 'used' : ''}`}
                    disabled={token.used || disabled}
                    onClick={() => onAction(token.type)}
                >
                    <img
                        className="action-token__icon"
                        src={actionIconMap[token.type]}
                        alt={token.type}
                    />
                </button>
            ))}
        </div>
    );
};

export default ActionTokens;
