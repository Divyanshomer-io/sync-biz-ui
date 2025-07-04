
import React, { useState } from 'react';
import { Search, ChevronDown, Plus, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalSales: number;
  totalPaid: number;
  pending: number;
  unitPreference: string;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onCustomerSelect,
  searchQuery,
  onSearchChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasCustomers = customers.length > 0;

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
          {/* Selected Customer Display */}
          {selectedCustomer && (
            <Card className="glass-card border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{selectedCustomer.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedCustomer.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer List */}
          {(isExpanded || !selectedCustomer) && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`glass-card cursor-pointer transition-all hover:bg-card/60 ${
                    selectedCustomer?.id === customer.id ? 'border-primary/20' : ''
                  }`}
                  onClick={() => {
                    onCustomerSelect(customer);
                    setIsExpanded(false);
                  }}
                >
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
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          ₹{customer.totalSales.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Sales</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerSelector;
