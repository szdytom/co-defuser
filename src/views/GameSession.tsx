import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import type { GameState, GameRole, ManualData } from '../game/types';
import type { GameConfig } from '../game/config';
import { DEFAULT_CONFIG } from '../game/config';
import { generateGame, generateManual } from '../game/generator';
import { OperatorView } from './OperatorView';
import { ExpertView } from './ExpertView';

interface GameSessionProps {
  role: GameRole;
}

function parseConfigFromSearch(): GameConfig {
  const hash = window.location.hash;
  const qIndex = hash.indexOf('?');
  const params = new URLSearchParams(qIndex >= 0 ? hash.slice(qIndex) : '');
  const n = (key: string) => {
    const v = params.get(key);
    return v !== null ? Number(v) : null;
  };
  const rawEnabled = params.get('em');
  return {
    timerSeconds: n('t') ?? DEFAULT_CONFIG.timerSeconds,
    maxMistakes: n('m') ?? DEFAULT_CONFIG.maxMistakes,
    moduleCount: n('mc') ?? DEFAULT_CONFIG.moduleCount,
    enabledModules: rawEnabled ? rawEnabled.split(',') : [...DEFAULT_CONFIG.enabledModules],
  };
}

export const GameSession: React.FC<GameSessionProps> = ({ role }) => {
  const { seed } = useParams<{ seed: string }>();
  const navigate = useNavigate();
  const config = useMemo(() => parseConfigFromSearch(), []);

  React.useEffect(() => {
    if (seed) sessionStorage.setItem('seed', seed);
  }, [seed]);

  const [gameState, setGameState] = useState<GameState | null>(() => {
    if (role !== 'operator') return null;
    const state = generateGame(seed || 'DEFAULT', config);
    state.role = role;
    return state;
  });

  const manualData = useMemo<ManualData | null>(() => {
    if (role !== 'expert') return null;
    return generateManual(seed || 'DEFAULT');
  }, [seed]);

  if (!seed) {
    return <Navigate to="/" replace />;
  }

  const handleAction = useCallback((puzzleIdx: number, action: unknown) => {
    setGameState(prev => {
      if (!prev) return prev;
      const puzzles = [...prev.puzzles];
      const inst = { ...puzzles[puzzleIdx] };
      if (inst.solved) return prev;

      const newActions = [...inst.pressedActions, action];
      const result = inst.moduleType.validate(inst.rule, inst.puzzle, newActions);

      if (result.correct) {
        inst.pressedActions = newActions;
        if (result.solved) {
          inst.solved = true;
        }
      } else {
        inst.pressedActions = [];
        return {
          ...prev,
          puzzles: puzzles.map((p, i) => (i === puzzleIdx ? inst : p)),
          mistakes: prev.mistakes + 1,
          lastWrongIdx: puzzleIdx,
          wrongCount: prev.wrongCount + 1,
          phase: prev.mistakes + 1 >= prev.maxMistakes ? 'lose' : prev.phase,
        };
      }

      puzzles[puzzleIdx] = inst;
      const allSolved = puzzles.every(p => p.solved);

      return {
        ...prev,
        puzzles,
        lastWrongIdx: -1,
        phase: allSolved ? 'win' : prev.mistakes >= prev.maxMistakes ? 'lose' : prev.phase,
      };
    });
  }, []);

  const handleTick = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const newTime = prev.timeRemaining - 1;
      if (newTime <= 0) {
        return { ...prev, timeRemaining: 0, phase: 'lose' };
      }
      return { ...prev, timeRemaining: newTime };
    });
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (role === 'operator') {
    if (!gameState) return null;
    return (
      <OperatorView
        gameState={gameState}
        onAction={handleAction}
        onBack={handleBack}
        onTick={handleTick}
      />
    );
  }

  if (!manualData) return null;

  return (
    <ExpertView
      manualData={manualData}
      onBack={handleBack}
    />
  );
};
