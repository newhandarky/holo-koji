import { fireEvent, render, screen } from '@testing-library/react';
import { GameRoomDrawNotification } from './GameRoomDrawNotification';

describe('GameRoomDrawNotification', () => {
    test('shows opponent draw toast', () => {
        render(
            <GameRoomDrawNotification
                recentDraw="玩家二 抽到了新卡"
                isActiveSelfDrawNotification={false}
                onDismiss={jest.fn()}
                onViewNow={jest.fn()}
                onKeyDown={jest.fn()}
            />
        );

        expect(screen.getByText('玩家二 抽到了新卡')).toBeInTheDocument();
        expect(screen.queryByRole('status', { name: '抽牌通知' })).not.toBeInTheDocument();
    });

    test('dispatches self draw notification actions and key handlers', () => {
        const onDismiss = jest.fn();
        const onViewNow = jest.fn();
        const onKeyDown = jest.fn();

        render(
            <GameRoomDrawNotification
                recentDraw={null}
                isActiveSelfDrawNotification
                onDismiss={onDismiss}
                onViewNow={onViewNow}
                onKeyDown={onKeyDown}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: '稍後確認' }));
        fireEvent.click(screen.getByRole('button', { name: '現在查看' }));
        fireEvent.keyDown(screen.getByRole('button', { name: '現在查看' }), { key: 'Enter' });

        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(onViewNow).toHaveBeenCalledTimes(1);
        expect(onKeyDown).toHaveBeenCalledWith(expect.any(Object), 'view_now');
    });
});
