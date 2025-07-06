
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Plus,
  Search,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MetricCard from '@/components/MetricCard';
import FloatingActionButton from '@/components/sales/FloatingActionButton';
import { useVendors } from '@/hooks/useVendors';
import { usePurchases } from '@/hooks/usePurchases';
import { usePaymentsMade } from '@/hooks/usePaymentsMade';
import VendorList from './VendorList';
import VendorDetailPanel from './VendorDetailPanel';

const PurchasesManagement: React.FC = () => {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [showCreatePurchase, setShowCreatePurchase] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const { data: vendors = [], refetch: refetchVendors } = useVendors();
  const { data: purchases = [], refetch: refetchPurchases } = usePurchases();
  const { data: paymentsMade = [], refetch: refetchPaymentsMade } = usePaymentsMade();

  // Set up real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVendors();
      refetchPurchases();
      refetchPaymentsMade();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetchVendors, refetchPurchases, refetchPaymentsMade]);

  // Calculate metrics
  const totalVendors = vendors.length;
  const totalPurchases = vendors.reduce((sum, vendor) => sum + (vendor.totalPurchases || 0), 0);
  const totalPaid = vendors.reduce((sum, vendor) => sum + (vendor.totalPaid || 0), 0);
  const totalPending = vendors.reduce((sum, vendor) => sum + (vendor.pending || 0), 0);

  const hasData = totalVendors > 0;

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.contact && vendor.contact.includes(searchTerm)) ||
    (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedVendor = vendors.find(vendor => vendor.id === selectedVendorId);

  const handleBackToList = () => {
    setSelectedVendorId(null);
  };

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendorId(vendorId);
  };

  const handleCreateVendor = () => {
    setShowCreateVendor(true);
  };

  const handleCreatePurchase = () => {
    setShowCreatePurchase(true);
  };

  const handleAddPayment = () => {
    setShowAddPayment(true);
  };

  const metrics = [
    {
      title: 'Total Purchases',
      value: `₹${totalPurchases.toLocaleString()}`,
      change: hasData ? 'All time' : 'No purchases yet',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: Package,
      color: hasData ? 'text-blue-500' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Payments Made',
      value: `₹${totalPaid.toLocaleString()}`,
      change: hasData ? 'Total paid' : 'No payments yet',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: DollarSign,
      color: hasData ? 'text-green-500' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Outstanding Payables',
      value: `₹${totalPending.toLocaleString()}`,
      change: totalPending > 0 ? 'Pending payment' : 'No dues pending',
      trend: totalPending > 0 ? 'down' as const : 'neutral' as const,
      icon: AlertCircle,
      color: totalPending > 0 ? 'text-red-400' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Total Vendors',
      value: totalVendors.toString(),
      change: hasData ? 'Active vendors' : 'Add vendors',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: Users,
      color: hasData ? 'text-primary' : 'text-muted-foreground',
      isEmpty: !hasData
    }
  ];

  if (selectedVendor) {
    return (
      <VendorDetailPanel
        vendor={selectedVendor}
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
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Purchases</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateVendor}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* Welcome Message for New Users */}
        {!hasData && (
          <div className="bg-card/40 border border-border/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Start Managing Purchases!</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Add your first vendor and start tracking purchases and payments.
            </p>
            <Button 
              size="sm" 
              onClick={handleCreateVendor}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Vendor
            </Button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Purchase Overview</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                color={metric.color}
                isEmpty={metric.isEmpty}
              />
            ))}
          </div>
        </section>

        {/* Search Bar */}
        {hasData && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Vendor List */}
        <VendorList
          vendors={filteredVendors}
          onVendorSelect={handleVendorSelect}
          isEmpty={!hasData}
        />
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onCreateCustomer={handleCreateVendor}
        onAddPayment={handleAddPayment}
        onCreateSale={handleCreatePurchase}
      />
    </div>
  );
};

export default PurchasesManagement;
