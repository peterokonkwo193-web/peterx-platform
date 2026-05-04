import React from 'react';

class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-rose-500/5 rounded-2xl border border-rose-500/10">
          <span className="material-symbols-outlined text-rose-500/50 text-3xl mb-2">warning</span>
          <p className="text-zinc-500 text-xs mb-3">Widget failed to load</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-1.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-500/20 transition-colors uppercase tracking-widest"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
