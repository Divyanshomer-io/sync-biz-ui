
import React, { useState } from 'react';
import { 
  ChevronDown,
  User, 
  Phone, 
  Mail, 
  MapPin,
  DollarSign,
  CreditCard,
  Receipt,
  Plus,
  Edit,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  totalSales: number;
  totalPaid: number;
  pending: number;
  unitPreference: string;
}

interface CustomerInfoPanelProps {
  customer: Customer;
  onAddPayment: () => void;
  onCreateSale: () => void;
  onEditCustomer?: () => void;
}

const CustomerInfoPanel: React.FC<CustomerInfoPanelProps> = ({
  customer,
  onAddPayment,
  onCreateSale,
  onEditCustomer
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusColor = (pending: number) => {
    if (pending === 0) return 'text-green-400';
    if (pending > 50000) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusBadge = (pending: number) => {
    if (pending === 0) return 'status-paid';
    if (pending > 50000) return 'status-overdue';
    return 'status-pending';
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            {customer.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onEditCustomer && (
              <Button variant="ghost" size="sm" onClick={onEditCustomer}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{customer.email}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground text-xs leading-relaxed">{customer.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground text-xs">GSTIN: {customer.gstin}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-card/40 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div className="text-lg font-bold text-foreground">
                ₹{customer.totalSales.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Sales</div>
            </div>
            <div className="bg-card/40 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-lg font-bold text-foreground">
                ₹{customer.totalPaid.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Paid</div>
            </div>
            <div className="bg-card/40 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Receipt className={`w-4 h-4 ${getStatusColor(customer.pending)}`} />
              </div>
              <div className={`text-lg font-bold ${getStatusColor(customer.pending)}`}>
                ₹{customer.pending.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          {/* Payment Status Badge */}
          {customer.pending > 0 && (
            <div className="flex justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(customer.pending)}`}>
                {customer.pending > 50000 ? 'High Pending Amount' : 'Payment Due'}
              </span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={onCreateSale}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Sale
            </Button>
            <Button 
              onClick={onAddPayment}
              variant="outline"
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Quick Payment
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CustomerInfoPanel;
