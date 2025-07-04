
import React from 'react';
import { Plus, Receipt, Package, CreditCard, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  isOpen: boolean;
  onToggle: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ isOpen, onToggle }) => {
  const actions = [
    {
      id: 'invoice',
      label: 'New Invoice',
      icon: Receipt,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('New Invoice')
    },
    {
      id: 'purchase',
      label: 'Add Purchase',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Add Purchase')
    },
    {
      id: 'payment',
      label: 'Record Payment',
      icon: CreditCard,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Record Payment')
    },
    {
      id: 'customer',
      label: 'Add Customer',
      icon: UserPlus,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Add Customer')
    }
  ];

  const handleActionClick = (action: () => void) => {
    action();
    onToggle();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-scale"
          onClick={onToggle}
        />
      )}

      {/* Action Buttons */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 space-y-3 animate-slide-up">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-3 animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="bg-card/90 backdrop-blur-sm text-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-border/50">
                {action.label}
              </span>
              <Button
                size="lg"
                className={`w-14 h-14 rounded-full shadow-lg ${action.color} transition-all duration-200 hover:scale-110 active:scale-95`}
                onClick={() => handleActionClick(action.action)}
              >
                <action.icon className="w-6 h-6 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={`fixed bottom-6 right-4 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
        onClick={onToggle}
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

export default QuickActions;
