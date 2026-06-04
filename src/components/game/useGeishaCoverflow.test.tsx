import { act, renderHook } from '@testing-library/react';
import type { PointerEvent } from 'react';
import {
    resolveCoverflowOffset,
    resolveCoverflowStep,
    resolveSwipeDirection,
    useGeishaCoverflow
} from './useGeishaCoverflow';

const makePointerTarget = () => ({
    setPointerCapture: jest.fn(),
    releasePointerCapture: jest.fn(),
    hasPointerCapture: jest.fn(() => true)
});

const makePointerEvent = (
    currentTarget: ReturnType<typeof makePointerTarget>,
    clientX: number,
    clientY: number,
    overrides: Partial<PointerEvent<HTMLDivElement>> = {}
) => ({
    pointerId: 1,
    pointerType: 'touch',
    button: 0,
    clientX,
    clientY,
    currentTarget,
    ...overrides
} as PointerEvent<HTMLDivElement>);

describe('useGeishaCoverflow', () => {
    test('resolves offset and step with wrap-around', () => {
        expect(resolveCoverflowOffset(0, 0, 7)).toBe(0);
        expect(resolveCoverflowOffset(6, 0, 7)).toBe(-1);
        expect(resolveCoverflowOffset(1, 6, 7)).toBe(2);
        expect(resolveCoverflowStep(0, 7, 'prev')).toBe(6);
        expect(resolveCoverflowStep(6, 7, 'next')).toBe(0);
    });

    test('ignores short and vertical swipe directions', () => {
        expect(resolveSwipeDirection(20, 0)).toBeNull();
        expect(resolveSwipeDirection(50, 80)).toBeNull();
        expect(resolveSwipeDirection(-50, 10)).toBe('next');
        expect(resolveSwipeDirection(50, 10)).toBe('prev');
    });

    test('steps active index and clamps when geisha count shrinks', () => {
        const { result, rerender } = renderHook(({ total }) => useGeishaCoverflow(total), {
            initialProps: { total: 7 }
        });

        act(() => {
            result.current.handleCoverflowStep('prev');
        });
        expect(result.current.activeGeishaIndex).toBe(6);

        rerender({ total: 3 });
        expect(result.current.activeGeishaIndex).toBe(2);
    });

    test('horizontal pointer swipe changes active index and vertical swipe does not', () => {
        const { result } = renderHook(() => useGeishaCoverflow(7));
        const currentTarget = makePointerTarget();

        act(() => {
            result.current.handlePointerDown(makePointerEvent(currentTarget, 100, 50));
            result.current.releasePointerDrag(makePointerEvent(currentTarget, 40, 55));
        });
        expect(result.current.activeGeishaIndex).toBe(1);

        act(() => {
            result.current.handlePointerDown(makePointerEvent(currentTarget, 40, 55));
            result.current.releasePointerDrag(makePointerEvent(currentTarget, 80, 130));
        });
        expect(result.current.activeGeishaIndex).toBe(1);
    });
});
