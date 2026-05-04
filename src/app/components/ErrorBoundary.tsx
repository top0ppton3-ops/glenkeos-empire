import { Component, ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './core/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
          <div className="max-w-md w-full p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--b1-gold-trim)' }}>
              Something Went Wrong
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--b1-gold-trim)' }}>
            {error.status} {error.statusText}
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {error.data?.message || 'The page you are looking for could not be found.'}
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="primary"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
      <div className="max-w-md w-full p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--b1-gold-trim)' }}>
          Error
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="secondary"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Go Home
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
