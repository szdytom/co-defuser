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
    const el = document.querySelector('.expert-view');
    const onScroll = () => setShowTop((el?.scrollTop ?? 0) > 200);
    el?.addEventListener('scroll', onScroll);
    return () => el?.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const container = document.querySelector('.expert-view');
    const el = document.getElementById(id);
    if (container && el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      container.scrollTop += elRect.top - containerRect.top;
    }
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
        <ul className="toc-list">
          {entries.map((entry) => (
            <li key={entry.moduleType.id}>
              <button className="toc-link" onClick={() => scrollTo(`manual-${entry.moduleType.id}`)}>
                {entry.moduleType.displayName}
              </button>
            </li>
          ))}
        </ul>
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
