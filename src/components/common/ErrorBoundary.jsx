import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Equity Citadel Protocol Error:', error, errorInfo);
    
    // Auto-reload on chunk load errors (occurs after a new deployment)
    const isChunkError = error?.name === 'ChunkLoadError' || 
                         error?.message?.includes('Failed to fetch dynamically imported module');
    
    if (isChunkError) {
      console.log('Chunk load error detected. Forcing application reload...');
      window.location.reload();
    }
    
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full bg-zinc-950/50 rounded-3xl border border-rose-500/20 glass-panel">
          <span className="material-symbols-outlined text-rose-500 text-5xl mb-4">report_problem</span>
          <h2 className="font-h2 text-xl mb-2 text-rose-400">Component Error</h2>
          <p className="text-zinc-500 text-sm max-w-md mb-2">We encountered an issue loading this section. Please try again or refresh the page.</p>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 max-w-xl text-left overflow-auto">
            <p className="text-rose-400 font-mono text-xs font-bold mb-1">Error Details:</p>
            <p className="text-rose-300 font-mono text-[10px] whitespace-pre-wrap">{this.state.error?.toString()}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              Retry Component
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/80 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
