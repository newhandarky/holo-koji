import React from 'react';

interface LobbyBrandSurfaceProps {
    onOpenDiagnostics: () => void;
    children: React.ReactNode;
}

const LobbyBrandSurface: React.FC<LobbyBrandSurfaceProps> = ({ onOpenDiagnostics, children }) => (
    <div className="lobby-shell">
        <section className="lobby-hero" aria-label="銀座十字路品牌首頁">
            <div className="lobby-hero__eyebrow">Ginza Crossroads</div>
            <h1 className="lobby-hero__title">銀座十字路</h1>
            <p className="lobby-hero__subtitle">
                在霓虹與餘光之間，讀懂對手留下的暗示，先一步奪下銀座夜色中的人心。
            </p>
            <div className="lobby-hero__details">
                <span>雙人對局</span>
                <span>房間對戰</span>
                <span>NPC 練習</span>
            </div>
            <button
                type="button"
                className="lobby-hero__diagnostics"
                onClick={onOpenDiagnostics}
            >
                系統診斷
            </button>
        </section>

        <section className="lobby-panel">
            {children}
        </section>
    </div>
);

export default LobbyBrandSurface;
