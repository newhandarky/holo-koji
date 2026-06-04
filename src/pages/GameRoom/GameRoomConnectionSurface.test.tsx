import { fireEvent, render, screen } from '@testing-library/react';
import {
    GameRoomConnectingSurface,
    GameRoomErrorSurface
} from './GameRoomConnectionSurface';

describe('GameRoomConnectionSurface', () => {
    test('renders the existing connecting message and websocket target', () => {
        render(<GameRoomConnectingSurface websocketUrl="ws://localhost:3001" />);

        expect(screen.getByText('連接伺服器中...')).toBeInTheDocument();
        expect(screen.getByText('正在連接到: ws://localhost:3001')).toBeInTheDocument();
        expect(document.querySelector('.spinner-custom')).toBeInTheDocument();
    });

    test('renders recovery error and returns to lobby', () => {
        const onReturnToLobby = jest.fn();
        render(<GameRoomErrorSurface error="房間資料無效，請重新建立對戰。" onReturnToLobby={onReturnToLobby} />);

        expect(screen.getByText('無法進入對戰')).toBeInTheDocument();
        expect(screen.getByText('房間資料無效，請重新建立對戰。')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '返回大廳' }));

        expect(onReturnToLobby).toHaveBeenCalledTimes(1);
    });
});
