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

const ActionTokens: React.FC<Props> = ({ tokens, onAction, disabled }) => {
    return (
        <div className="d-flex flex-wrap mb-3">
            {tokens.map((token, idx) => (
                <button
                    key={idx}
                    className={`action-token btn me-2 mb-2 ${token.used ? 'used' : ''}`}
                    disabled={token.used || disabled}
                    onClick={() => onAction(token.type)}
                >
                    {token.type}
                </button>
            ))}
        </div>
    );
};

export default ActionTokens;
