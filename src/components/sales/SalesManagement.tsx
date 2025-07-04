
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  DollarSign,
  Receipt,
  CreditCard,
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerSelector from './CustomerSelector';
import SalesInvoiceList from './SalesInvoiceList';
import CreateSaleModal from './CreateSaleModal';
import PaymentModal from './PaymentModal';
import CustomerAnalytics from './CustomerAnalytics';

const SalesManagement: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock customer data - in real app this would come from database
  const customers = [
    {
      id: 1,
      name: 'Rajesh Enterprises',
      gstin: '07ABCDE1234F1Z5',
      email: 'rajesh@example.com',
      phone: '+91 98765 43210',
      address: '123 Business Street, Mumbai, MH 400001',
      totalSales: 125000,
      totalPaid: 95000,
      pending: 30000,
      unitPreference: 'kg'
    }
  ];

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleCreateSale = () => {
    setShowCreateSale(true);
  };

  const handleAddPayment = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Sales Management</h1>
          <Button
            onClick={handleCreateSale}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Customer Selection */}
        <CustomerSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {selectedCustomer ? (
          <div className="space-y-6">
            {/* Customer Dashboard */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedCustomer.name}</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">{selectedCustomer.address}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      GSTIN: {selectedCustomer.gstin}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card/40 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      ₹{selectedCustomer.totalSales.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="bg-card/40 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CreditCard className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      ₹{selectedCustomer.totalPaid.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Paid</div>
                  </div>
                  <div className="bg-card/40 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Receipt className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      ₹{selectedCustomer.pending.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateSale}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Sale
                  </Button>
                  <Button 
                    onClick={handleAddPayment}
                    variant="outline"
                    className="flex-1"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <CustomerAnalytics customer={selectedCustomer} />

            {/* Sales Invoice List */}
            <SalesInvoiceList customerId={selectedCustomer.id} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Customer</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Choose a customer to view their sales history and create new invoices
            </p>
            <Button onClick={handleCreateSale} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create First Sale
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={handleCreateSale}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Sale
          </Button>
          <Button
            onClick={handleAddPayment}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CreateSaleModal
        isOpen={showCreateSale}
        onClose={() => setShowCreateSale(false)}
        customer={selectedCustomer}
      />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default SalesManagement;
