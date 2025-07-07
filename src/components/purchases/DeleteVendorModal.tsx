
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useDeleteVendor } from '@/hooks/useVendors';
import { useVendorPurchases } from '@/hooks/usePurchases';
import { useVendorPayments } from '@/hooks/usePaymentsMade';
import { Vendor } from '@/hooks/useVendors';

interface DeleteVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onDeleted: () => void;
}

const DeleteVendorModal: React.FC<DeleteVendorModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteVendor = useDeleteVendor();
  
  const { data: purchases = [] } = useVendorPurchases(vendor?.id || '');
  const { data: payments = [] } = useVendorPayments(vendor?.id || '');

  const hasTransactions = purchases.length > 0 || payments.length > 0;

  const handleDelete = async () => {
    if (!vendor || hasTransactions) return;
    
    setIsDeleting(true);
    try {
      await deleteVendor.mutateAsync(vendor.id);
      onDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Vendor
          </DialogTitle>
          <DialogDescription>
            {hasTransactions ? (
              <div className="space-y-2">
                <p>Cannot delete this vendor because they have associated transactions:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {purchases.length > 0 && (
                    <li>{purchases.length} purchase record(s)</li>
                  )}
                  {payments.length > 0 && (
                    <li>{payments.length} payment record(s)</li>
                  )}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Remove all associated transactions before deleting the vendor.
                </p>
              </div>
            ) : (
              <p>
                Are you sure you want to delete <strong>{vendor?.name}</strong>? 
                This action cannot be undone.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {!hasTransactions && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Vendor'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVendorModal;
