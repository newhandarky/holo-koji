import React, { useEffect, useRef, useState } from 'react';
import type { OpeningDealModalModel, OpeningDealModalStep } from './OpeningDealModal.types';

interface OpeningDealModalProps {
    isOpen: boolean;
    model: OpeningDealModalModel | null;
    onComplete: () => void;
}

const CardBack: React.FC<{ className?: string; model: OpeningDealModalModel; style?: React.CSSProperties }> = ({
    className = '',
    model,
    style
}) => (
    <div
        className={`opening-deal-card-back ${model.cardBackTheme.className} ${className}`.trim()}
        data-testid="opening-deal-card-back"
        data-card-back-theme={model.cardBackTheme.id}
        style={style}
        aria-hidden="true"
    >
        <span className="opening-deal-card-back__mark" />
    </div>
);

const renderStepCard = (step: OpeningDealModalStep, model: OpeningDealModalModel) => {
    if (step.type === 'OPENING_DEAL_COMPLETE') {
        return null;
    }

    const style = {
        ['--opening-step-delay' as string]: `${step.delayMs}ms`,
        ['--opening-step-duration' as string]: `${step.durationMs}ms`
    } as React.CSSProperties;

    if (step.type === 'BURN_HIDDEN_CARD') {
        return (
            <CardBack
                key={step.id}
                model={model}
                className="opening-deal-card-back--reserve"
                style={style}
            />
        );
    }

    return (
        <CardBack
            key={step.id}
            model={model}
            className={`opening-deal-card-back--dealt opening-deal-card-back--${step.viewerRole}`}
            style={style}
        />
    );
};

const OpeningDealModal: React.FC<OpeningDealModalProps> = ({ isOpen, model, onComplete }) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const [isCompleteVisible, setIsCompleteVisible] = useState(false);

    useEffect(() => {
        if (!isOpen || !model) {
            return undefined;
        }

        setIsCompleteVisible(false);
        dialogRef.current?.focus();

        const completeStep = model.steps.find((step) => step.type === 'OPENING_DEAL_COMPLETE');
        const completeVisibleTimer = window.setTimeout(
            () => setIsCompleteVisible(true),
            completeStep ? completeStep.delayMs : Math.max(model.totalMs - 520, 0)
        );
        const closeTimer = window.setTimeout(onComplete, model.totalMs);

        return () => {
            window.clearTimeout(completeVisibleTimer);
            window.clearTimeout(closeTimer);
        };
    }, [isOpen, model, onComplete]);

    if (!isOpen || !model) {
        return null;
    }

    const dealSteps = model.steps.filter((step) => step.type === 'DEAL_CARD_BACK');
    const firstDealSteps = dealSteps.filter((step) => step.turnRole === 'first');
    const secondDealSteps = dealSteps.filter((step) => step.turnRole === 'second');
    const getLaneLabel = (steps: OpeningDealModalStep[], fallback: string) => {
        const representative = steps[0];
        const viewerLabel = representative?.viewerRole === 'self'
            ? '你'
            : representative?.viewerRole === 'opponent'
                ? '對手'
                : '玩家';
        return representative?.targetPlayerName
            ? `${fallback} ${representative.targetPlayerName}（${viewerLabel}）`
            : fallback;
    };

    return (
        <div
            ref={dialogRef}
            className={`opening-deal-modal ${model.reducedMotion ? 'opening-deal-modal--reduced' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="開局發牌"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <div className="opening-deal-modal__panel">
                <div className="opening-deal-modal__header">
                    <div className="opening-deal-modal__title">開局發牌</div>
                    <div className="opening-deal-modal__status" aria-live="polite">
                        {isCompleteVisible ? '發牌完成' : '準備開始'}
                    </div>
                </div>

                <div className="opening-deal-modal__stage">
                    <div className="opening-deal-modal__deck" aria-label="中央牌堆">
                        <CardBack model={model} className="opening-deal-card-back--deck" />
                    </div>

                    <div className="opening-deal-modal__reserve" aria-label="隱藏保留牌">
                        {model.steps.filter((step) => step.type === 'BURN_HIDDEN_CARD').map((step) => renderStepCard(step, model))}
                    </div>

                    <div className="opening-deal-modal__lane opening-deal-modal__lane--first" aria-label={getLaneLabel(firstDealSteps, '先手方向')}>
                        <div className="opening-deal-modal__lane-label">{getLaneLabel(firstDealSteps, '先手方向')}</div>
                        {firstDealSteps.map((step) => renderStepCard(step, model))}
                    </div>

                    <div className="opening-deal-modal__lane opening-deal-modal__lane--second" aria-label={getLaneLabel(secondDealSteps, '後手方向')}>
                        <div className="opening-deal-modal__lane-label">{getLaneLabel(secondDealSteps, '後手方向')}</div>
                        {secondDealSteps.map((step) => renderStepCard(step, model))}
                    </div>

                    {isCompleteVisible && (
                        <div className="opening-deal-modal__complete" role="status">發牌完成</div>
                    )}
                </div>

                <div className="opening-deal-modal__summary">
                    <span>保留牌 1</span>
                    <span>先手 {firstDealSteps.length}</span>
                    <span>後手 {secondDealSteps.length}</span>
                </div>
            </div>
        </div>
    );
};

export default OpeningDealModal;
