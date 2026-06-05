import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildDiagnosticsSnapshot, buildDiagnosticsSummaryItems } from './diagnosticsSummary';
import { DiagnosticsSnapshot } from './types';
import { DiagnosticsPlaytestChecklist } from './DiagnosticsPlaytestChecklist';

const DiagnosticsPage: React.FC = () => {
    const navigate = useNavigate();
    const [snapshot, setSnapshot] = useState<DiagnosticsSnapshot>(() => buildDiagnosticsSnapshot());

    useEffect(() => {
        const updateSnapshot = () => {
            setSnapshot(buildDiagnosticsSnapshot());
        };

        updateSnapshot();
        const timerId = window.setInterval(updateSnapshot, 1000);
        return () => window.clearInterval(timerId);
    }, []);

    const items = buildDiagnosticsSummaryItems(snapshot) ?? [];

    return (
        <div className="lobby-background diagnostics-page">
            <div className="container-fluid px-3 px-md-4 py-4 py-md-5">
                <div className="diagnostics-shell">
                    <div className="diagnostics-shell__header">
                        <div>
                            <div className="diagnostics-shell__kicker">開發工具頁</div>
                            <h1 className="diagnostics-shell__title">系統診斷</h1>
                            <p className="diagnostics-shell__subtitle">
                                只保留環境與連線摘要，不顯示房間內隱藏資訊。
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-light diagnostics-shell__back"
                            onClick={() => navigate('/')}
                        >
                            返回首頁
                        </button>
                    </div>

                    <div className="diagnostics-grid" data-testid="diagnostics-grid">
                        {items.map((item) => (
                            <section key={item.label} className={`diagnostics-card diagnostics-card--${item.statusTone ?? 'neutral'}`}>
                                <div className="diagnostics-card__label">{item.label}</div>
                                <div className="diagnostics-card__value">{item.value}</div>
                                {item.helpText && <div className="diagnostics-card__help">{item.helpText}</div>}
                            </section>
                        ))}
                    </div>
                    <DiagnosticsPlaytestChecklist />
                </div>
            </div>
        </div>
    );
};

export default DiagnosticsPage;
