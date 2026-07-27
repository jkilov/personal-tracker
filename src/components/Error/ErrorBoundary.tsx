import { Component, type ReactNode } from "react";
import Error from "./Error";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Error boundaries must be class components (React has no hook equivalent).
// Catches render-time throws anywhere below it and shows the fallback
// instead of unmounting the entire app.
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Unhandled render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Error />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
