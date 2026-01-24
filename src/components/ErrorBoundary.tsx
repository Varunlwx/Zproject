'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error, and displays a fallback UI.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log the error to console for debugging
        console.error('ErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="error-boundary-fallback">
                    <div className="error-boundary-content">
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#E85D04"
                            strokeWidth="1.5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <h2>Something went wrong</h2>
                        <p>We're sorry, but something unexpected happened. Please try again.</p>
                        <button onClick={this.handleReset} className="error-boundary-btn">
                            Try Again
                        </button>
                    </div>

                    <style jsx>{`
                        .error-boundary-fallback {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 300px;
                            padding: 40px 20px;
                            background: #FAFAFA;
                        }
                        .error-boundary-content {
                            text-align: center;
                            max-width: 400px;
                        }
                        .error-boundary-content h2 {
                            font-size: 20px;
                            font-weight: 600;
                            color: #1A1A1A;
                            margin: 16px 0 8px;
                        }
                        .error-boundary-content p {
                            font-size: 14px;
                            color: #6B6B6B;
                            margin: 0 0 24px;
                            line-height: 1.5;
                        }
                        .error-boundary-btn {
                            padding: 12px 32px;
                            background: #1A1A1A;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        }
                        .error-boundary-btn:hover {
                            background: #E85D04;
                            transform: translateY(-1px);
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
