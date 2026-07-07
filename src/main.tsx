import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

declare var __DEV__: boolean;

if (!__DEV__) {
  const style = document.createElement('style');
  style.textContent = `
    .wire, .target-btn, button, .module-header, .header {
      user-select: none;
      -webkit-user-select: none;
    }
  `;
  document.head.appendChild(style);
}

const root = document.getElementById('root');
if (root) {
  try {
    createRoot(root).render(<App />);
  } catch (e) {
    root.innerHTML = `<pre style="color:red;padding:20px;">Error: ${e instanceof Error ? e.message + '\n' + e.stack : String(e)}</pre>`;
  }
}
