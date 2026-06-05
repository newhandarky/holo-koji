import React, { useMemo, useState } from 'react';

interface PlaytestChecklistItem {
    label: string;
    prompt: string;
}

const playtestChecklistItems: PlaytestChecklistItem[] = [
    {
        label: '房型',
        prompt: '請截圖後回報：NPC / online 雙人 / 重整重連 / 再來一場，正常 / 異常 / 不確定。'
    },
    {
        label: '順序確認',
        prompt: '請截圖後回報：雙方確認前是否沒有提早進入 opening，正常 / 異常 / 不確定。'
    },
    {
        label: 'ready sheet',
        prompt: '請截圖後回報：進入 playing 後是否沒有殘留，正常 / 異常 / 不確定。'
    },
    {
        label: 'opening deal',
        prompt: '請截圖後回報：是否只播放一次，且不與 ready sheet 或 order decision 重疊，正常 / 異常 / 不確定。'
    },
    {
        label: 'opening hand reveal',
        prompt: '請截圖後回報：是否在 opening deal 完成後才出現，且揭示前阻擋互動，正常 / 異常 / 不確定。'
    },
    {
        label: 'draw toast',
        prompt: '請截圖後回報：必要流程中是否延後，流程結束後是否仍會出現，正常 / 異常 / 不確定。'
    },
    {
        label: 'pending interaction',
        prompt: '請截圖後回報：gift / competition modal 是否沒有干擾安全抽牌提示，正常 / 異常 / 不確定。'
    },
    {
        label: 'round summary',
        prompt: '請截圖後回報：結算畫面是否沒有被抽牌提示蓋住，結束後沒有殘留，正常 / 異常 / 不確定。'
    },
    {
        label: 'reconnect',
        prompt: '請截圖後回報：重整後是否沒有重複加入或錯誤提示，正常 / 異常 / 不確定。'
    }
];

const buildPlaytestChecklistText = (): string => [
    '試玩時序確認',
    '請貼回這段內容，並在異常項目後面補一句你看到的現象。',
    '',
    ...playtestChecklistItems.map((item) => `- ${item.label}: 正常 / 異常 / 不確定。${item.prompt}`)
].join('\n');

export const DiagnosticsPlaytestChecklist: React.FC = () => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'fallback'>('idle');
    const checklistText = useMemo(() => buildPlaytestChecklistText(), []);

    const handleCopy = async () => {
        try {
            if (!navigator.clipboard?.writeText) {
                setCopyStatus('fallback');
                return;
            }

            await navigator.clipboard.writeText(checklistText);
            setCopyStatus('copied');
        } catch {
            setCopyStatus('fallback');
        }
    };

    return (
        <section className="diagnostics-playtest" aria-labelledby="diagnostics-playtest-title">
            <div className="diagnostics-playtest__header">
                <div>
                    <h2 id="diagnostics-playtest-title" className="diagnostics-playtest__title">試玩時序確認</h2>
                    <p className="diagnostics-playtest__description">
                        遊玩後截圖這個區塊，或複製確認清單貼回來。這裡只列觀察項目，不讀取房間內隱藏資訊。
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-light diagnostics-playtest__copy"
                    onClick={handleCopy}
                >
                    複製確認清單
                </button>
            </div>

            <div className="diagnostics-playtest__grid">
                {playtestChecklistItems.map((item) => (
                    <article key={item.label} className="diagnostics-playtest__item">
                        <div className="diagnostics-playtest__label">{item.label}</div>
                        <div className="diagnostics-playtest__prompt">{item.prompt}</div>
                    </article>
                ))}
            </div>

            {copyStatus === 'copied' && (
                <div className="diagnostics-playtest__status" role="status">已複製確認清單</div>
            )}

            {copyStatus === 'fallback' && (
                <div className="diagnostics-playtest__fallback">
                    <div className="diagnostics-playtest__status" role="status">
                        無法自動複製，請手動選取下方文字。
                    </div>
                    <textarea
                        className="diagnostics-playtest__textarea"
                        aria-label="可手動複製的試玩確認清單"
                        readOnly
                        value={checklistText}
                    />
                </div>
            )}
        </section>
    );
};
