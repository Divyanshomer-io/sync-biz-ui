
import React, { useState } from 'react';
import { Search, ChevronDown, User, Plus, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CreateCustomerModal from './CreateCustomerModal';
import { Customer } from '@/hooks/useCustomers';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCustomerCreated: (customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    unitPreference?: string;
    notes?: string;
  }) => Promise<Customer>;
  onQuickPayment: (customer: Customer) => void;
  onNewSale: (customer: Customer) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onCustomerSelect,
  searchQuery,
  onSearchChange,
  onCustomerCreated,
  onQuickPayment,
  onNewSale
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasCustomers = customers.length > 0;

  const handleCustomerCreated = async (newCustomerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    unitPreference?: string;
    notes?: string;
  }): Promise<Customer> => {
    const createdCustomer = await onCustomerCreated(newCustomerData);
    onCustomerSelect(createdCustomer);
    return createdCustomer;
  };

  const toggleCustomerExpansion = (customerId: string) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card/40 border-border/50"
        />
      </div>

      {hasCustomers ? (
        <div className="space-y-2">
          {/* Customer List */}
          <div className="space-y-2 max-h-none overflow-visible">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="space-y-2">
                  <Card className="glass-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">
                              ₹{customer.totalSales?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Sales</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCustomerExpansion(customer.id)}
                          >
                            <ChevronDown className={`w-4 h-4 transform transition-transform ${
                              expandedCustomerId === customer.id ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Expanded Customer Details */}
                  {expandedCustomerId === customer.id && (
                    <Card className="glass-card border-primary/20">
                      <CardContent className="p-4">
                        {/* Customer Contact Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2 text-foreground">{customer.phone}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="ml-2 text-foreground">{customer.email}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Address:</span>
                              <span className="ml-2 text-foreground text-xs">{customer.address}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">GSTIN:</span>
                              <span className="ml-2 text-foreground text-xs">{customer.gstin}</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-card/40 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-foreground">
                              ₹{customer.totalSales?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Sales</div>
                          </div>
                          <div className="bg-card/40 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-400">
                              ₹{customer.totalPaid?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Paid</div>
                          </div>
                          <div className="bg-card/40 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-red-400">
                              ₹{customer.pending?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Pending</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => onNewSale(customer)}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            New Sale
                          </Button>
                          <Button 
                            onClick={() => onQuickPayment(customer)}
                            variant="outline"
                            className="flex-1"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Quick Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No customers found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Customers Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start by adding your first customer to create sales
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
};

export default CustomerSelector;
