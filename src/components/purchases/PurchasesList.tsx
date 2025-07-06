
import React from 'react';
import { Package, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Purchase } from '@/hooks/usePurchases';

interface PurchasesListProps {
  vendorId: string;
  purchases: Purchase[];
  showHeader?: boolean;
  title?: string;
}

const PurchasesList: React.FC<PurchasesListProps> = ({ 
  vendorId, 
  purchases, 
  showHeader = true, 
  title = "Purchases" 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    return status === 'Paid' ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'Paid' ? 'status-paid' : 'status-overdue';
  };

  const hasPurchases = purchases.length > 0;

  return (
    <Card className="glass-card">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            {title} ({purchases.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {hasPurchases ? (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="activity-item">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{purchase.item}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(purchase.date)} • {purchase.quantity} units @ ₹{purchase.rate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        ₹{Number(purchase.total_amount).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(purchase.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Purchases Yet</h3>
            <p className="text-muted-foreground text-sm">
              No purchase records found for this vendor
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchasesList;
