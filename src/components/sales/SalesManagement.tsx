
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Plus,
  Search,
  ShoppingCart,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import CustomerList from './CustomerList';
import CustomerDetailPanel from './CustomerDetailPanel';
import CreateCustomerModal from './CreateCustomerModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceListEnhanced from './InvoiceListEnhanced';

const SalesManagement: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  const { customers, refetch: refetchCustomers } = useCustomers();
  const { invoices, refetch: refetchInvoices } = useInvoices();
  const { refetch: refetchPayments } = usePayments();

  // Set up real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCustomers();
      refetchInvoices();
      refetchPayments();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetchCustomers, refetchInvoices, refetchPayments]);

  const hasData = customers.length > 0;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.contact && customer.contact.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCustomer = customers.find(customer => customer.id === selectedCustomerId);

  const handleBackToList = () => {
    setSelectedCustomerId(null);
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleAddCustomerClick = () => {
    setShowAddCustomer(true);
  };

  const handleCloseAddCustomer = () => {
    setShowAddCustomer(false);
  };

  const handleCustomerCreated = () => {
    setShowAddCustomer(false);
    refetchCustomers();
  };

  const handleCreateInvoice = () => {
    setShowCreateInvoice(true);
  };

  const handleCloseCreateInvoice = () => {
    setShowCreateInvoice(false);
  };

  const handleInvoiceCreated = () => {
    setShowCreateInvoice(false);
    refetchInvoices();
  };

  if (selectedCustomer) {
    return (
      <CustomerDetailPanel
        customer={selectedCustomer}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Sales</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCreateInvoice}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddCustomerClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* Welcome Message for New Users */}
        {!hasData && (
          <div className="bg-card/40 border border-border/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Start Managing Sales!</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Add your first customer and start tracking sales and payments.
            </p>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddCustomerClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Customer
            </Button>
          </div>
        )}

        {/* Search Bar */}
        {hasData && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Customer List */}
        <CustomerList
          customers={filteredCustomers}
          onCustomerSelect={handleCustomerSelect}
          isEmpty={!hasData}
        />

        {/* All Invoices List */}
        {invoices.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              All Invoices
            </h2>
            <InvoiceListEnhanced />
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      <CreateCustomerModal
        isOpen={showAddCustomer}
        onClose={handleCloseAddCustomer}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateInvoice}
        onClose={handleCloseCreateInvoice}
      />
    </div>
  );
};

export default SalesManagement;
