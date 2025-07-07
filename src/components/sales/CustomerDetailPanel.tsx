
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Trash2, 
  Plus, 
  CreditCard,
  DollarSign,
  TrendingUp,
  Package,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { usePayments } from '@/hooks/usePayments';
import CustomerInfoPanel from './CustomerInfoPanel';
import SalesInvoiceList from './SalesInvoiceList';
import PaymentsReceivedList from './PaymentsReceivedList';
import CreateSaleModal from './CreateSaleModal';
import PaymentModal from './PaymentModal';
import DeleteCustomerModal from './DeleteCustomerModal';
import UpdateCustomerModal from './UpdateCustomerModal';

interface CustomerDetailPanelProps {
  customer: Customer;
  onBack: () => void;
}

const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({ customer, onBack }) => {
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { getSalesByCustomer } = useSales();
  const { payments } = usePayments();

  const customerSales = getSalesByCustomer(customer.id);
  const customerPayments = payments.filter(p => p.customer_id === customer.id);

  // Calculate metrics
  const totalSales = customer.totalSales || 0;
  const totalPaid = customer.totalPaid || 0;
  const outstanding = customer.pending || 0;
  const thisMonthSales = customerSales
    .filter(sale => {
      const saleDate = new Date(sale.created_at);
      const now = new Date();
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);

  const transformSalesToInvoices = (sales: any[]) => {
    return sales.map(sale => ({
      ...sale,
      date: sale.invoice_date,
      grandTotal: sale.total_amount,
      status: 'paid' as const,
      items: [{
        name: sale.item_name,
        quantity: sale.quantity,
        unit: sale.unit,
        rate: sale.rate_per_unit,
        amount: sale.subtotal
      }]
    }));
  };

  const handleDeleteCustomer = () => {
    setShowDeleteModal(false);
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{customer.name}</h1>
                {customer.gst_number && (
                  <p className="text-xs text-muted-foreground">GSTIN: {customer.gst_number}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            className="flex-1"
            onClick={() => setShowCreateSale(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => setShowAddPayment(true)}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{totalSales.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <DollarSign className="w-3 h-3" />
                Total Sales
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{totalPaid.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Received
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                ₹{outstanding.toLocaleString()}
              </div>
              <div className={`text-sm flex items-center justify-center gap-1 ${outstanding > 0 ? 'text-red-600/80 dark:text-red-400/80' : 'text-muted-foreground/80'}`}>
                <Package className="w-3 h-3" />
                Outstanding
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{thisMonthSales.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                This Month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-6">
              {customerSales.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Recent Sales</h3>
                  <SalesInvoiceList 
                    customerId={customer.id}
                    invoices={transformSalesToInvoices(customerSales.slice(0, 5))}
                    showHeader={false}
                  />
                </div>
              )}
              
              {customerPayments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Recent Payments</h3>
                  <PaymentsReceivedList 
                    customerId={customer.id}
                    payments={customerPayments.slice(0, 5)}
                    showHeader={false}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <SalesInvoiceList 
              customerId={customer.id}
              invoices={transformSalesToInvoices(customerSales)}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsReceivedList 
              customerId={customer.id}
              payments={customerPayments}
            />
          </TabsContent>

          <TabsContent value="info">
            <CustomerInfoPanel customer={customer} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <CreateSaleModal
        isOpen={showCreateSale}
        onClose={() => setShowCreateSale(false)}
        customer={customer}
        onInvoiceCreated={() => setShowCreateSale(false)}
      />

      <PaymentModal
        isOpen={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        customer={customer}
        onPaymentAdded={() => setShowAddPayment(false)}
      />

      <DeleteCustomerModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        customer={customer}
        onDeleted={handleDeleteCustomer}
      />

      <UpdateCustomerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        customer={customer}
      />
    </div>
  );
};

export default CustomerDetailPanel;
