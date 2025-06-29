'use client';

import { Card, CardBody } from '@nextui-org/react';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  description?: string;
}

export default function StatsCard({ title, value, icon, color, description }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-400',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400',
  };

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-default-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-default-400 mt-2">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}