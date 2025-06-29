'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="flex gap-3">
              <AlertCircle className="w-8 h-8 text-danger" />
              <div className="flex flex-col">
                <p className="text-md font-semibold">Bir Hata Oluştu</p>
                <p className="text-small text-default-500">
                  Beklenmeyen bir hata meydana geldi
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-default-600 mb-4">
                {this.state.error?.message || 'Bilinmeyen hata'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
              >
                Sayfayı Yenile
              </button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;