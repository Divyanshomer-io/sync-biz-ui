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
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div
      className={`metric-card rounded-xl border p-4 bg-card shadow-sm transition-all duration-200
                  flex flex-col justify-between h-full min-h-[120px] max-h-[150px]
                  overflow-hidden ${isEmpty ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-current/10 ${color} ${isEmpty ? 'opacity-50' : ''}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`text-xs sm:text-sm font-medium ${getTrendColor()} truncate max-w-[120px] text-right`}>
          {change}
        </span>
      </div>

      <div className="space-y-1 overflow-hidden">
        <p className={`text-xl sm:text-2xl font-bold truncate ${isEmpty ? 'text-muted-foreground' : 'text-foreground'}`}>
          {value}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-tight truncate max-w-full">
          {title}
        </p>
        {isEmpty && (
          <p className="text-[10px] text-muted-foreground/70 truncate">No data yet</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
