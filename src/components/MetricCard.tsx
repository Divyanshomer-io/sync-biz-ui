
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
  isEmpty?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  isEmpty = false
}) => {
  const getTrendColor = () => {
    if (isEmpty) return 'text-muted-foreground';
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className={`metric-card min-w-[280px] sm:min-w-[320px] ${isEmpty ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-current/10 ${color} ${isEmpty ? 'opacity-50' : ''}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className={`text-sm font-medium ${getTrendColor()}`}>
          {change}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className={`text-2xl font-bold ${isEmpty ? 'text-muted-foreground' : 'text-foreground'}`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {isEmpty && (
          <p className="text-xs text-muted-foreground/70">No data yet</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
