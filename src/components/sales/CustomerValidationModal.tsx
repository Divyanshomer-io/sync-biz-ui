import React, { useState } from 'react';
import { Search, User, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import CreateCustomerModal from './CreateCustomerModal';
import { Customer } from '@/hooks/useCustomers';

interface CustomerValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onCustomerValidated: (customer: Customer) => void;
  onCustomerCreated: (customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    unitPreference?: string;
    notes?: string;
  }) => Promise<Customer>;
  action: 'sale' | 'payment';
}

const CustomerValidationModal: React.FC<CustomerValidationModalProps> = ({
  isOpen,
  onClose,
  customers,
  onCustomerValidated,
  onCustomerCreated,
  action
}) => {
  const [customerName, setCustomerName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [noCustomerFound, setNoCustomerFound] = useState(false);

  const handleSearch = () => {
    if (!customerName.trim()) return;

    const results = customers.filter(customer =>
      customer.name.toLowerCase().includes(customerName.toLowerCase())
    );

    setSearchResults(results);
    setShowResults(true);
    setNoCustomerFound(results.length === 0);
  };

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerValidated(customer);
    handleClose();
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCustomerCreated = async (newCustomerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    unitPreference?: string;
    notes?: string;
  }) => {
    const createdCustomer = await onCustomerCreated(newCustomerData);
    onCustomerValidated(createdCustomer);
    setShowCreateModal(false);
    handleClose();
  };

  const handleClose = () => {
    setCustomerName('');
    setSearchResults([]);
    setShowResults(false);
    setNoCustomerFound(false);
    onClose();
  };

  const actionText = action === 'sale' ? 'create a sale' : 'add a payment';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Customer to {action === 'sale' ? 'Create Sale' : 'Add Payment'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Customer Name</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Enter customer name..."
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setShowResults(false);
                    setNoCustomerFound(false);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={!customerName.trim()}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showResults && (
              <div className="space-y-3">
                {searchResults.length > 0 ? (
                  <>
                    <Label className="text-sm font-medium text-green-600">
                      Found {searchResults.length} customer(s):
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((customer) => (
                        <Card
                          key={customer.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{customer.name}</div>
                                  <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ₹{customer.totalSales?.toLocaleString() || 0}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : noCustomerFound ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Customer Not Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No customer found with name "{customerName}". Would you like to create a new customer?
                      </p>
                      <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Customer
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {!showResults && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  Enter a customer name to search, or create a new customer to {actionText}.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateNew} variant="outline" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                New Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  );
};

export default CustomerValidationModal;
