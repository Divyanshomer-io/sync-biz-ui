
import React from 'react';
import { Building2, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vendor } from '@/hooks/useVendors';

interface VendorInfoPanelProps {
  vendor: Vendor;
}

const VendorInfoPanel: React.FC<VendorInfoPanelProps> = ({ vendor }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Vendor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
              <div className="text-foreground font-medium">{vendor.name}</div>
            </div>
            
            {vendor.contact && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Contact Number
                </label>
                <div className="text-foreground">{vendor.contact}</div>
              </div>
            )}
            
            {vendor.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Address
                </label>
                <div className="text-foreground">{vendor.email}</div>
              </div>
            )}
            
            {vendor.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Address
                </label>
                <div className="text-foreground">{vendor.address}</div>
              </div>
            )}
            
            {vendor.gstin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  GSTIN
                </label>
                <div className="text-foreground font-mono">{vendor.gstin}</div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Added On
              </label>
              <div className="text-foreground">{formatDate(vendor.created_at)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{(vendor.totalPurchases || 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Purchases</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{(vendor.totalPaid || 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-600/80 dark:text-green-400/80">Payments Made</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg col-span-2">
              <div className={`text-2xl font-bold ${(vendor.pending || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                ₹{(vendor.pending || 0).toLocaleString()}
              </div>
              <div className={`text-sm ${(vendor.pending || 0) > 0 ? 'text-red-600/80 dark:text-red-400/80' : 'text-muted-foreground/80'}`}>
                {(vendor.pending || 0) > 0 ? 'Outstanding Payable' : 'No Outstanding Dues'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorInfoPanel;
