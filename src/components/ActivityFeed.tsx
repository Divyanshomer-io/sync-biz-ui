
import React from 'react';
import { Receipt, CreditCard, Users, Clock } from 'lucide-react';

interface ActivityFeedProps {
  isEmpty?: boolean;
  timeFilter?: string;
  sales?: any[];
  payments?: any[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  isEmpty = false, 
  timeFilter = '1month',
  sales = [],
  payments = []
}) => {
  // Combine and sort sales and payments by date
  const activities = [
    ...sales.map(sale => ({
      id: sale.id,
      type: 'sale',
      title: `Sale - ${sale.item_name}`,
      description: `${sale.quantity} ${sale.unit} @ ₹${sale.rate_per_unit} - ₹${Number(sale.total_amount).toLocaleString()}`,
      time: new Date(sale.created_at).toLocaleDateString('en-IN'),
      status: 'completed',
      icon: Receipt,
      amount: Number(sale.total_amount)
    })),
    ...payments.map(payment => ({
      id: payment.id,
      type: 'payment',
      title: 'Payment Received',
      description: `₹${Number(payment.amount_paid).toLocaleString()} via ${payment.payment_mode || 'cash'}`,
      time: new Date(payment.created_at).toLocaleDateString('en-IN'),
      status: 'completed',
      icon: CreditCard,
      amount: Number(payment.amount_paid)
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (isEmpty || activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="space-y-3">
          <div className="text-4xl opacity-50">📋</div>
          <p className="text-lg font-medium">No activity yet</p>
          <p className="text-sm">Your recent transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="activity-item">
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
            <div className="text-sm font-medium text-foreground">
              ₹{activity.amount.toLocaleString()}
            </div>
            <span className={`${getStatusColor(activity.status)}`}>
              {getStatusText(activity.status)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
