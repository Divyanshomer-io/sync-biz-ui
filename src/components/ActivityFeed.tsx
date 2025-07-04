
import React from 'react';
import { Receipt, CreditCard, Package, Users, Clock } from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'sale',
      title: 'Invoice #INV-001234',
      description: 'ABC Industries - ₹45,000',
      time: '2 hours ago',
      status: 'paid',
      icon: Receipt
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      description: 'XYZ Trading - ₹32,000',
      time: '4 hours ago',
      status: 'completed',
      icon: CreditCard
    },
    {
      id: 3,
      type: 'purchase',
      title: 'Purchase Order #PO-567',
      description: 'Raw Materials - ₹18,500',
      time: '6 hours ago',
      status: 'pending',
      icon: Package
    },
    {
      id: 4,
      type: 'customer',
      title: 'New Customer Added',
      description: 'PQR Manufacturing',
      time: '1 day ago',
      status: 'completed',
      icon: Users
    },
    {
      id: 5,
      type: 'sale',
      title: 'Invoice #INV-001235',
      description: 'LMN Enterprises - ₹67,500',
      time: '1 day ago',
      status: 'overdue',
      icon: Receipt
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'completed':
        return 'Done';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <activity.icon className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`${getStatusColor(activity.status)}`}>
                {getStatusText(activity.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActivityFeed;
