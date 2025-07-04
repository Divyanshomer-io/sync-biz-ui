
import React from 'react';
import { X, AlertTriangle, Clock, CreditCard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ isOpen, onClose }) => {
  const alerts = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Overdue',
      message: 'ABC Industries - ₹45,000 overdue by 5 days',
      time: '2 hours ago',
      priority: 'high',
      icon: CreditCard
    },
    {
      id: 2,
      type: 'tax',
      title: 'GST Return Filing Due',
      message: 'Monthly GST return filing due in 3 days',
      time: '1 day ago',
      priority: 'medium',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Raw Material A running low - 15 units left',
      time: '2 days ago',
      priority: 'medium',
      icon: Package
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Follow-up Reminder',
      message: 'Contact XYZ Trading for pending quotation',
      time: '3 days ago',
      priority: 'low',
      icon: Clock
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-card z-50 shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`p-4 border-l-4 ${getPriorityColor(alert.priority)} transition-all duration-200 hover:bg-card/80`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <alert.icon className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs">
                  Mark as Read
                </Button>
                <Button size="sm" className="text-xs">
                  Take Action
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full">
            View All Notifications
          </Button>
        </div>
      </div>
    </>
  );
};

export default AlertsPanel;
