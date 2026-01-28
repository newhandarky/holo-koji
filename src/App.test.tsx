import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// 基本渲染測試：確認大廳標題存在
test('應該渲染大廳標題', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: '花見小路' });
  expect(heading).toBeInTheDocument();
});
