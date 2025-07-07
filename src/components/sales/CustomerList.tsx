
import React from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Customer } from '@/hooks/useCustomers';

interface CustomerListProps {
  customers: Customer[];
  onCustomerSelect: (customerId: string) => void;
  isEmpty: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onCustomerSelect, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Customers Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Add your first customer to start tracking sales and managing customer relationships.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-foreground">Customers ({customers.length})</h2>
      </div>
      
      <div className="space-y-3">
        {customers.map((customer) => (
          <Card 
            key={customer.id} 
            className="glass-card cursor-pointer hover:bg-muted/5 transition-all duration-200"
            onClick={() => onCustomerSelect(customer.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Customer Info Row */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                      {customer.contact && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{customer.contact}</span>
                        </div>
                      )}
                      {customer.email && customer.email !== `${customer.name.toLowerCase().replace(/\s+/g, '')}@example.com` && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
                    {customer.gst_number && customer.gst_number !== 'GSTIN not provided' && (
                      <div className="text-xs text-muted-foreground mt-1">
                        GSTIN: {customer.gst_number}
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
                
                {/* Financial Summary Row */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
                  {/* Total Sales */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground truncate">
                        ₹{(customer.totalSales || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Sales</div>
                    </div>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {(customer.pending || 0) > 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold truncate ${(customer.pending || 0) > 0 ? 'text-red-400' : 'text-green-500'}`}>
                        ₹{(customer.pending || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(customer.pending || 0) > 0 ? 'Outstanding' : 'Paid Up'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
