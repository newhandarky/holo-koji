import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

interface PointerDragState {
    pointerId: number;
    startX: number;
    startY: number;
}

export const SWIPE_THRESHOLD_PX = 36;

export const resolveCoverflowOffset = (index: number, activeIndex: number, total: number): number => {
    if (total <= 1) {
        return 0;
    }

    let offset = index - activeIndex;
    if (offset > total / 2) {
        offset -= total;
    } else if (offset < -total / 2) {
        offset += total;
    }
    return offset;
};

export const resolveCoverflowStep = (
    activeIndex: number,
    total: number,
    direction: 'prev' | 'next'
): number => {
    if (total <= 0) {
        return 0;
    }

    const offset = direction === 'prev' ? -1 : 1;
    return (activeIndex + offset + total) % total;
};

export const resolveSwipeDirection = (
    deltaX: number,
    deltaY: number,
    threshold = SWIPE_THRESHOLD_PX
): 'prev' | 'next' | null => {
    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY)) {
        return null;
    }

    return deltaX < 0 ? 'next' : 'prev';
};

export const useGeishaCoverflow = (totalGeishas: number) => {
    const [activeGeishaIndex, setActiveGeishaIndex] = useState(0);
    const swipeStateRef = useRef<PointerDragState | null>(null);

    useEffect(() => {
        setActiveGeishaIndex((currentIndex) => {
            if (totalGeishas <= 0) {
                return 0;
            }

            return Math.min(currentIndex, totalGeishas - 1);
        });
    }, [totalGeishas]);

    const handleCoverflowStep = useCallback((direction: 'prev' | 'next') => {
        setActiveGeishaIndex((current) => resolveCoverflowStep(current, totalGeishas, direction));
    }, [totalGeishas]);

    const getCoverflowOffset = useCallback((index: number) => (
        resolveCoverflowOffset(index, activeGeishaIndex, totalGeishas)
    ), [activeGeishaIndex, totalGeishas]);

    const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        swipeStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    const releasePointerDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
        const dragState = swipeStateRef.current;

        if (!dragState || dragState.pointerId !== event.pointerId) {
            return;
        }

        swipeStateRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (totalGeishas <= 0) {
            return;
        }

        const direction = resolveSwipeDirection(
            event.clientX - dragState.startX,
            event.clientY - dragState.startY
        );
        if (!direction) {
            return;
        }

        setActiveGeishaIndex((current) => resolveCoverflowStep(current, totalGeishas, direction));
    }, [totalGeishas]);

    return {
        activeGeishaIndex,
        handleCoverflowStep,
        handlePointerDown,
        releasePointerDrag,
        getCoverflowOffset
    };
};
