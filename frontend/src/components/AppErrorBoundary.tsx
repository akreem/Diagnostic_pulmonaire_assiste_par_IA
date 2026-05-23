import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "Une erreur inattendue est survenue.";
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: ""
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: errorMessage(error)
    };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render error", error, info.componentStack);
  }

  handleWindowError = (event: ErrorEvent) => {
    console.error("Global application error", event.error ?? event.message);
    this.setState({
      hasError: true,
      message: errorMessage(event.error ?? event.message)
    });
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection", event.reason);
    this.setState({
      hasError: true,
      message: errorMessage(event.reason)
    });
  };

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="global-error-shell" role="alert">
        <section>
          <p className="eyebrow">Erreur applicative</p>
          <h1>Impossible d'afficher cette vue</h1>
          <p>{this.state.message}</p>
          <div>
            <button onClick={this.handleRetry} type="button">
              Reessayer
            </button>
            <button className="secondary" onClick={() => window.location.reload()} type="button">
              Recharger
            </button>
          </div>
        </section>
      </main>
    );
  }
}
