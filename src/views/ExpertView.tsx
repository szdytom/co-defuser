import React, { useState, useEffect } from 'react';
import type { ManualData } from '../game/types';
import { ThemeToggle } from '../components/ThemeToggle';
import './ExpertView.css';

interface ExpertViewProps {
  manualData: ManualData;
  onBack: () => void;
}

export const ExpertView: React.FC<ExpertViewProps> = ({ manualData, onBack }) => {
  const { entries, seed } = manualData;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="expert-view content-wrapper">
      <div id="expert-top" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={onBack}>返回</button>
        <ThemeToggle />
      </div>
      <div className="manual-header">
        <h2>操作手册</h2>
        <p className="seed-label">种子: {seed}</p>
      </div>

      <div className="manual-section toc-section">
        <h3>目录</h3>
        <div className="toc-grid">
          {entries.map((entry, i) => (
            <button key={entry.moduleType.id} className="toc-link" onClick={() => scrollTo(`manual-${entry.moduleType.id}`)}>
              <span className="toc-num">{i + 1}</span>
              <span className="toc-name">{entry.moduleType.displayName}</span>
            </button>
          ))}
        </div>
      </div>

      {entries.map((entry) => (
        <div key={entry.moduleType.id} id={`manual-${entry.moduleType.id}`}>
          {entry.moduleType.expertComponent({ rule: entry.rule })}
        </div>
      ))}

      {showTop && (
        <button className="back-to-top" onClick={() => scrollTo('expert-top')}>
          ↑ 顶部
        </button>
      )}
    </div>
  );
};
