
import React, { useState } from 'react';
import { 
  ArrowLeft,
  Building2,
  Package,
  Calendar,
  Plus,
  CreditCard,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MetricCard from '@/components/MetricCard';
import { Vendor } from '@/hooks/useVendors';
import { useVendorPurchases } from '@/hooks/usePurchases';
import { useVendorPayments } from '@/hooks/usePaymentsMade';
import VendorInfoPanel from './VendorInfoPanel';
import PurchasesList from './PurchasesList';
import PaymentsMadeList from './PaymentsMadeList';
import CreatePurchaseModal from './CreatePurchaseModal';
import AddPaymentModal from './AddPaymentModal';
import UpdateVendorModal from './UpdateVendorModal';
import DeleteVendorModal from './DeleteVendorModal';

interface VendorDetailPanelProps {
  vendor: Vendor;
  onBack: () => void;
}

const VendorDetailPanel: React.FC<VendorDetailPanelProps> = ({ vendor, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreatePurchase, setShowCreatePurchase] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showUpdateVendor, setShowUpdateVendor] = useState(false);
  const [showDeleteVendor, setShowDeleteVendor] = useState(false);
  
  const { data: purchases = [] } = useVendorPurchases(vendor.id);
  const { data: payments = [] } = useVendorPayments(vendor.id);

  // Calculate recent activity metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentPurchases = purchases.filter(purchase => 
    new Date(purchase.created_at) >= thirtyDaysAgo
  );
  const recentPayments = payments.filter(payment => 
    new Date(payment.created_at) >= thirtyDaysAgo
  );

  const recentPurchaseAmount = recentPurchases.reduce((sum, purchase) => 
    sum + Number(purchase.total_amount), 0
  );

  const metrics = [
    {
      title: 'Total Purchases',
      value: `₹${(vendor.totalPurchases || 0).toLocaleString()}`,
      change: `${purchases.length} transactions`,
      trend: 'up' as const,
      icon: Package,
      color: 'text-blue-500',
      isEmpty: false
    },
    {
      title: 'Payments Made',
      value: `₹${(vendor.totalPaid || 0).toLocaleString()}`,
      change: `${payments.length} payments`,
      trend: 'up' as const,
      icon: CreditCard,
      color: 'text-green-500',
      isEmpty: false
    },
    {
      title: 'Outstanding Payable',
      value: `₹${(vendor.pending || 0).toLocaleString()}`,
      change: (vendor.pending || 0) > 0 ? 'Due for payment' : 'All cleared',
      trend: (vendor.pending || 0) > 0 ? 'down' as const : 'neutral' as const,
      icon: CreditCard,
      color: (vendor.pending || 0) > 0 ? 'text-red-400' : 'text-muted-foreground',
      isEmpty: false
    },
    {
      title: 'This Month',
      value: `₹${recentPurchaseAmount.toLocaleString()}`,
      change: `${recentPurchases.length} purchases`,
      trend: recentPurchases.length > 0 ? 'up' as const : 'neutral' as const,
      icon: Calendar,
      color: recentPurchases.length > 0 ? 'text-primary' : 'text-muted-foreground',
      isEmpty: false
    }
  ];

  const handleVendorDeleted = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{vendor.name}</h1>
                {vendor.gstin && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">GSTIN: {vendor.gstin}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Actions Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowUpdateVendor(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteVendor(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreatePurchase(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Purchase
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddPayment(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowCreatePurchase(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Purchase
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAddPayment(true)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowUpdateVendor(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Vendor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteVendor(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vendor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* KPI Metrics Cards */}
       {/* Purchase KPI Metrics */}
<section className="space-y-4">
  <h2 className="text-lg font-semibold text-foreground">Vendor Overview</h2>

  <div className="grid grid-cols-2 gap-3 sm:gap-4">
    {metrics.map((metric, index) => (
      <Card key={index} className="glass-card">
        <CardContent className="p-3 sm:p-4 text-center">
          <MetricCard
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
            isEmpty={metric.isEmpty}
          />
        </CardContent>
      </Card>
    ))}
  </div>
</section>




        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="purchases" className="text-xs sm:text-sm">Purchases</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
            <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              <PurchasesList
                vendorId={vendor.id}
                purchases={purchases.slice(0, 5)}
                showHeader={true}
                title="Recent Purchases"
              />
              <PaymentsMadeList
                vendorId={vendor.id}
                payments={payments.slice(0, 5)}
                showHeader={true}
                title="Recent Payments"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="purchases">
            <PurchasesList
              vendorId={vendor.id}
              purchases={purchases}
              showHeader={false}
            />
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentsMadeList
              vendorId={vendor.id}
              payments={payments}
              showHeader={false}
            />
          </TabsContent>
          
          <TabsContent value="info">
            <VendorInfoPanel vendor={vendor} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <CreatePurchaseModal
        isOpen={showCreatePurchase}
        onClose={() => setShowCreatePurchase(false)}
        vendor={vendor}
      />
      
      <AddPaymentModal
        isOpen={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        vendor={vendor}
      />

      <UpdateVendorModal
        isOpen={showUpdateVendor}
        onClose={() => setShowUpdateVendor(false)}
        vendor={vendor}
      />

      <DeleteVendorModal
        isOpen={showDeleteVendor}
        onClose={() => setShowDeleteVendor(false)}
        vendor={vendor}
        onDeleted={handleVendorDeleted}
      />
    </div>
  );
};

export default VendorDetailPanel;
