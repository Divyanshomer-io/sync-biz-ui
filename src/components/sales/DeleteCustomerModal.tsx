
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
import { Customer, useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { usePayments } from '@/hooks/usePayments';

interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onDeleted: () => void;
}

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCustomer } = useCustomers();
  const { getSalesByCustomer } = useSales();
  const { payments } = usePayments();

  const customerSales = customer ? getSalesByCustomer(customer.id) : [];
  const customerPayments = customer ? payments.filter(p => p.customer_id === customer.id) : [];

  const hasTransactions = customerSales.length > 0 || customerPayments.length > 0;

 const handleDelete = async () => {
  if (!customer) return;
  
  setIsDeleting(true);
  try {
    await deleteCustomer(customer.id);
    onDeleted();
    onClose();
  } catch (error) {
    console.error('Error deleting customer:', error);
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
            Delete Customer
          </DialogTitle>
          <DialogDescription>
            {hasTransactions ? (
              <div className="space-y-2">
                <p>Cannot delete this customer because they have associated transactions:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {customerSales.length > 0 && (
                    <li>{customerSales.length} sales record(s)</li>
                  )}
                  {customerPayments.length > 0 && (
                    <li>{customerPayments.length} payment record(s)</li>
                  )}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Remove all associated transactions before deleting the customer.
                </p>
              </div>
            ) : (
              <p>
  Are you sure you want to delete <strong>{customer?.name}</strong>? <br />
  This action cannot be undone. Associated transactions will remain, but without a customer linked.
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
          
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Customer'}
            </Button>
          
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCustomerModal;
