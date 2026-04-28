'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-base p-6 text-center text-text-primary">
          <div className="max-w-md w-full p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-2xl">
            <h2 className="text-2xl font-bold text-status-danger mb-4">Ops! Ocorreu um erro.</h2>
            <p className="text-text-secondary mb-6">
              Ocorreu um problema inesperado na aplicação.
            </p>
            <div className="text-left bg-black/30 p-4 rounded-xl mb-6 overflow-auto max-h-40">
              <code className="text-xs text-status-danger">
                {this.state.error?.message || 'Erro desconhecido'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-medium rounded-xl transition-all"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
