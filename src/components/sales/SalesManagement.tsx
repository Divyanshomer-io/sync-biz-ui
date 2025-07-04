
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerSelector from './CustomerSelector';
import CustomerInfoPanel from './CustomerInfoPanel';
import SalesInvoiceList from './SalesInvoiceList';
import CreateSaleModal from './CreateSaleModal';
import PaymentModal from './PaymentModal';
import CustomerAnalytics from './CustomerAnalytics';
import CustomerValidationModal from './CustomerValidationModal';
import { useToast } from '@/hooks/use-toast';

const SalesManagement: React.FC = () => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerValidation, setShowCustomerValidation] = useState(false);
  const [validationAction, setValidationAction] = useState<'sale' | 'payment'>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Start with empty customers array - no default data
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerCreated = (newCustomer: any) => {
    setCustomers(prev => [...prev, newCustomer]);
    toast({
      title: "Success",
      description: "Customer created successfully!"
    });
  };

  const handleCreateSale = () => {
    setValidationAction('sale');
    setShowCustomerValidation(true);
  };

  const handleAddPayment = () => {
    setValidationAction('payment');
    setShowCustomerValidation(true);
  };

  const handleCustomerValidated = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerValidation(false);
    
    if (validationAction === 'sale') {
      setShowCreateSale(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleInvoiceCreated = (invoice: any) => {
    setInvoices(prev => [...prev, invoice]);
    
    // Update customer totals
    setCustomers(prev => prev.map(customer => {
      if (customer.id === selectedCustomer.id) {
        const newTotalSales = customer.totalSales + invoice.grandTotal;
        const newPending = customer.pending + invoice.grandTotal;
        return {
          ...customer,
          totalSales: newTotalSales,
          pending: newPending
        };
      }
      return customer;
    }));

    // Update selected customer
    if (selectedCustomer) {
      const updatedCustomer = {
        ...selectedCustomer,
        totalSales: selectedCustomer.totalSales + invoice.grandTotal,
        pending: selectedCustomer.pending + invoice.grandTotal
      };
      setSelectedCustomer(updatedCustomer);
    }

    toast({
      title: "Success",
      description: `Invoice ${invoice.id} created successfully!`
    });
  };

  const handlePaymentAdded = (payment: any) => {
    setPayments(prev => [...prev, payment]);
    
    // Update customer totals
    setCustomers(prev => prev.map(customer => {
      if (customer.id === selectedCustomer.id) {
        const newTotalPaid = customer.totalPaid + payment.amount;
        const newPending = Math.max(0, customer.pending - payment.amount);
        return {
          ...customer,
          totalPaid: newTotalPaid,
          pending: newPending
        };
      }
      return customer;
    }));

    // Update selected customer
    if (selectedCustomer) {
      const updatedCustomer = {
        ...selectedCustomer,
        totalPaid: selectedCustomer.totalPaid + payment.amount,
        pending: Math.max(0, selectedCustomer.pending - payment.amount)
      };
      setSelectedCustomer(updatedCustomer);
    }

    toast({
      title: "Success",
      description: `Payment of ₹${payment.amount.toLocaleString()} added successfully!`
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Sales Management</h1>
          <div className="flex gap-2">
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
      </div>

      <div className="px-4 space-y-6">
        {/* Customer Selection */}
        <CustomerSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCustomerCreated={handleCustomerCreated}
        />

        {selectedCustomer ? (
          <div className="space-y-6">
            {/* Customer Info Panel */}
            <CustomerInfoPanel
              customer={selectedCustomer}
              onAddPayment={handleAddPayment}
              onCreateSale={handleCreateSale}
            />

            {/* Analytics */}
            <CustomerAnalytics customer={selectedCustomer} />

            {/* Sales Invoice List */}
            <SalesInvoiceList 
              customerId={selectedCustomer.id}
              invoices={invoices.filter(inv => inv.customerId === selectedCustomer.id)}
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Customers Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start by creating your first customer to begin managing sales
            </p>
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
          </div>
        )}
      </div>

      {/* Floating Action Buttons - positioned above + Sale button */}
      <div className="fixed bottom-24 right-4 z-50">
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={handleAddPayment}
            size="sm"
            variant="outline" 
            className="rounded-full shadow-lg bg-white hover:bg-gray-50"
            title="Add Payment"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Button>
          <Button
            onClick={handleCreateSale}
            size="sm"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
            title="Create New Sale"
          >
            <Plus className="w-4 h-4 mr-2" />
            Sale
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CustomerValidationModal
        isOpen={showCustomerValidation}
        onClose={() => setShowCustomerValidation(false)}
        customers={customers}
        onCustomerValidated={handleCustomerValidated}
        onCustomerCreated={handleCustomerCreated}
        action={validationAction}
      />

      <CreateSaleModal
        isOpen={showCreateSale}
        onClose={() => setShowCreateSale(false)}
        customer={selectedCustomer}
        onInvoiceCreated={handleInvoiceCreated}
      />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        customer={selectedCustomer}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  );
};

export default SalesManagement;
