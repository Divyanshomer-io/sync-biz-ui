
import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Vendor } from '@/hooks/useVendors';

interface VendorListProps {
  vendors: Vendor[];
  onVendorSelect: (vendorId: string) => void;
  isEmpty: boolean;
}

const VendorList: React.FC<VendorListProps> = ({ vendors, onVendorSelect, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Vendors Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Add your first vendor to start tracking purchases and managing supplier relationships.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Vendors ({vendors.length})</h2>
      </div>
      
      <div className="space-y-3">
        {vendors.map((vendor) => (
          <Card 
            key={vendor.id} 
            className="glass-card cursor-pointer hover:bg-muted/5 transition-all duration-200"
            onClick={() => onVendorSelect(vendor.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{vendor.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {vendor.contact && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{vendor.contact}</span>
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{vendor.email}</span>
                        </div>
                      )}
                    </div>
                    {vendor.gstin && (
                      <div className="text-xs text-muted-foreground mt-1">
                        GSTIN: {vendor.gstin}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Purchase Summary */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-semibold text-foreground">
                          ₹{(vendor.totalPurchases || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Purchases</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      {(vendor.pending || 0) > 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                      <div>
                        <div className={`font-semibold ${(vendor.pending || 0) > 0 ? 'text-red-400' : 'text-green-500'}`}>
                          ₹{(vendor.pending || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(vendor.pending || 0) > 0 ? 'Pending' : 'Paid Up'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorList;
