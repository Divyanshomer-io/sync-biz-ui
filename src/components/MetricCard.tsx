
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="metric-card min-w-[280px] sm:min-w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-current/10 ${color}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className={`text-sm font-medium ${getTrendColor()}`}>
          {change}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

export default MetricCard;
