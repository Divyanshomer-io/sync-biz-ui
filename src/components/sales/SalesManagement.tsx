
import React, { useState } from 'react';
import { 
  Plus, 
  User, 
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerSelector from './CustomerSelector';
import CustomerInfoPanel from './CustomerInfoPanel';
import SalesInvoiceList from './SalesInvoiceList';
import CreateSaleModal from './CreateSaleModal';
import PaymentModal from './PaymentModal';
import CustomerAnalytics from './CustomerAnalytics';
import CustomerValidationModal from './CustomerValidationModal';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

const SalesManagement: React.FC = () => {
  const { toast } = useToast();
  const { customers, createCustomer, refetch: refetchCustomers } = useCustomers();
  const { createSale, getSalesByCustomer } = useSales();
  const { createPayment } = usePayments();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerValidation, setShowCustomerValidation] = useState(false);
  const [validationAction, setValidationAction] = useState<'sale' | 'payment'>('sale');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerCreated = async (newCustomerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    unitPreference?: string;
    notes?: string;
  }): Promise<Customer> => {
    try {
      const newCustomer = await createCustomer({
        name: newCustomerData.name,
        email: newCustomerData.email,
        phone: newCustomerData.phone,
        address: newCustomerData.address,
        gstin: newCustomerData.gstin,
        unitPreference: newCustomerData.unitPreference,
        notes: newCustomerData.notes
      });
      
      toast({
        title: "Success",
        description: "Customer created successfully!"
      });
      
      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const handleCreateSale = () => {
    setValidationAction('sale');
    setShowCustomerValidation(true);
  };

  const handleAddPayment = () => {
    setValidationAction('payment');
    setShowCustomerValidation(true);
  };

  const handleCustomerValidated = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerValidation(false);
    
    if (validationAction === 'sale') {
      setShowCreateSale(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleInvoiceCreated = async (invoiceData: any) => {
    try {
      await createSale({
        customerId: selectedCustomer!.id,
        items: invoiceData.items,
        gstRate: invoiceData.gstRate,
        transportCharges: invoiceData.transportCharges,
        transportDetails: invoiceData.transportDetails,
        notes: invoiceData.notes
      });

      // Refresh customer data to update totals
      refetchCustomers();

      toast({
        title: "Success",
        description: `Sale created successfully!`
      });
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  const handlePaymentAdded = async (paymentData: any) => {
    try {
      await createPayment({
        customerId: selectedCustomer!.id,
        amount: paymentData.amount,
        paymentMode: paymentData.paymentMode,
        date: paymentData.date,
        notes: paymentData.notes
      });

      // Refresh customer data to update totals
      refetchCustomers();

      toast({
        title: "Success",
        description: `Payment of ₹${paymentData.amount.toLocaleString()} added successfully!`
      });
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  // Transform sales data to match expected invoice format
  const transformSalesToInvoices = (sales: any[]) => {
    return sales.map(sale => ({
      ...sale,
      date: sale.invoice_date,
      grandTotal: sale.total_amount,
      status: 'completed' as const,
      items: [{
        name: sale.item_name,
        quantity: sale.quantity,
        unit: sale.unit,
        rate: sale.rate_per_unit,
        amount: sale.subtotal
      }]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Sales Management</h1>
        </div>
      </div>

      <div className="pt-16 pb-20 px-4 space-y-6">
        {/* Customer Search */}
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
            {/* Single Customer Info Panel with integrated Analytics */}
            <CustomerInfoPanel
              customer={selectedCustomer}
              onAddPayment={handleAddPayment}
              onCreateSale={handleCreateSale}
            />

            {/* Sales Invoice List */}
            <SalesInvoiceList 
              customerId={selectedCustomer.id}
              invoices={transformSalesToInvoices(getSalesByCustomer(selectedCustomer.id))}
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

      {/* Fixed Action Buttons - positioned above bottom navigation */}
      <div className="fixed bottom-24 right-4 z-50">
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={() => setShowCustomerValidation(true)}
            size="sm"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
          <Button
            onClick={handleAddPayment}
            size="sm"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Button>
          <Button
            onClick={handleCreateSale}
            size="sm"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
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
