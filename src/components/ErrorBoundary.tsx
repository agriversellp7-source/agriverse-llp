import { Component, type ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface State { error: Error | null }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} resetError={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
