import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * תפיסת שגיאות רנדור – מונע דף לבן ומציג הודעה ידידותית.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="container py-5 text-center" dir="rtl">
          <h2 className="mb-3">אופס, משהו השתבש</h2>
          <p className="text-muted mb-3">נסה לרענן את הדף או לחזור לדף הבית.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            נסה שוב
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
