
import React, { useState } from 'react';
import { Plus, User, CreditCard, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onCreateCustomer: () => void;
  onAddPayment: () => void;
  onCreateSale: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCreateCustomer,
  onAddPayment,
  onCreateSale
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const actions = [
    {
      label: 'New Customer',
      icon: User,
      action: onCreateCustomer,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Add Payment',
      icon: CreditCard,
      action: onAddPayment,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Create Sale',
      icon: Receipt,
      action: onCreateSale,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Action Buttons */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 space-y-3">
          {actions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="bg-card/90 backdrop-blur-sm text-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-border/50">
                {action.label}
              </span>
              <Button
                size="lg"
                className={`w-12 h-12 rounded-full shadow-lg ${action.color} transition-all duration-200 hover:scale-110`}
                onClick={() => handleAction(action.action)}
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={`fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
        onClick={toggleMenu}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </Button>
    </>
  );
};

export default FloatingActionButton;
