import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StartScreen } from './views/StartScreen';
import { GameSession } from './views/GameSession';

const router = createHashRouter([
  { path: '/', element: <StartScreen /> },
  {
    path: '/operator/:seed',
    element: <GameSessionWrapper role="operator" />,
  },
  {
    path: '/manual/:seed',
    element: <GameSessionWrapper role="expert" />,
  },
  { path: '*', element: <StartScreen /> },
]);

function GameSessionWrapper({ role }: { role: 'operator' | 'expert' }) {
  return <GameSession role={role} />;
}

export const App: React.FC = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
