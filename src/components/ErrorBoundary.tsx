import React, { Component } from 'react';

export class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#ff4757', padding: 40, fontFamily: 'monospace', fontSize: 14, whiteSpace: 'pre-wrap' }}>
          <h2 style={{ color: '#e94560' }}>Render Error</h2>
          <p>{this.state.error.message}</p>
          <pre style={{ marginTop: 16, color: '#888' }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
