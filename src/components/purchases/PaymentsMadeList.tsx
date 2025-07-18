
import React from 'react';
import { DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMade } from '@/hooks/usePaymentsMade';

interface PaymentsMadeListProps {
  vendorId: string;
  payments: PaymentMade[];
  showHeader?: boolean;
  title?: string;
}

const PaymentsMadeList: React.FC<PaymentsMadeListProps> = ({ 
  vendorId, 
  payments, 
  showHeader = true, 
  title = "Payments Made" 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentModeIcon = (mode: string) => {
    return mode === 'cash' ? (
      <DollarSign className="w-4 h-4 text-green-500" />
    ) : (
      <CreditCard className="w-4 h-4 text-blue-500" />
    );
  };

  const hasPayments = payments.length > 0;

  return (
    <Card className="glass-card">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {title} ({payments.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {hasPayments ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="activity-item">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      {getPaymentModeIcon(payment.mode)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Payment Made</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(payment.date)} • {payment.mode}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ₹{Number(payment.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.mode.charAt(0).toUpperCase() + payment.mode.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Yet</h3>
            <p className="text-muted-foreground text-sm">
              No payment records found for this vendor
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsMadeList;
