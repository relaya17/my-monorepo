import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <AlertTriangle className="w-14 h-14 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">משהו השתבש</h1>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {this.state.message || "שגיאה לא צפויה התרחשה. אנא רענן את הדף."}
          </p>
          <Button onClick={() => window.location.reload()}>רענן דף</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
