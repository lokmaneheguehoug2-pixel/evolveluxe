'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-champagne-50 flex items-center justify-center p-6">
          <section role="alert" className="max-w-md rounded-lg bg-champagne-100 p-8 text-center text-burgundy-700 shadow-sm">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10" aria-hidden="true" />
            <h1 className="font-serif text-2xl">Admin dashboard unavailable</h1>
            <p className="mt-3 text-sm text-burgundy/60">Some dashboard data could not be displayed. Try rendering the dashboard again.</p>
            <button type="button" onClick={this.handleReset} className="luxe-btn-primary mt-6 inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
