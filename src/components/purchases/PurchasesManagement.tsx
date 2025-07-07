
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Plus,
  Search,
  Package,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVendors } from '@/hooks/useVendors';
import { usePurchases } from '@/hooks/usePurchases';
import { usePaymentsMade } from '@/hooks/usePaymentsMade';
import VendorList from './VendorList';
import VendorDetailPanel from './VendorDetailPanel';
import AddVendorModal from './AddVendorModal';

const PurchasesManagement: React.FC = () => {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVendor, setShowAddVendor] = useState(false);

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

  const hasData = vendors.length > 0;

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

  const handleAddVendorClick = () => {
    setShowAddVendor(true);
  };

  const handleCloseAddVendor = () => {
    setShowAddVendor(false);
  };

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
            onClick={handleAddVendorClick}
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
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddVendorClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Vendor
            </Button>
          </div>
        )}

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

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={showAddVendor}
        onClose={handleCloseAddVendor}
      />
    </div>
  );
};

export default PurchasesManagement;
