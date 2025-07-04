
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  User,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MetricCard from './MetricCard';
import ChartSection from './ChartSection';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import AlertsPanel from './AlertsPanel';

interface DashboardProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeSection, onSectionChange }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Check if we have any real business data
  useEffect(() => {
    // In a real app, this would check actual data from backend
    // For now, we'll assume no data since we removed the mock data
    setHasData(false);
  }, []);

  const emptyMetrics = [
    {
      title: 'Sales This Month',
      value: '₹0',
      change: 'Start selling',
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-muted-foreground',
      isEmpty: true
    },
    {
      title: 'Purchases This Month', 
      value: '₹0',
      change: 'No purchases yet',
      trend: 'neutral' as const,
      icon: Package,
      color: 'text-muted-foreground',
      isEmpty: true
    },
    {
      title: 'Payments Received',
      value: '₹0',
      change: 'No payments yet',
      trend: 'neutral' as const,
      icon: DollarSign,
      color: 'text-muted-foreground',
      isEmpty: true
    },
    {
      title: 'Outstanding Dues',
      value: '₹0',
      change: 'No dues pending',
      trend: 'neutral' as const,
      icon: TrendingDown,
      color: 'text-muted-foreground',
      isEmpty: true
    },
    {
      title: 'Total Customers',
      value: '0',
      change: 'Add customers',
      trend: 'neutral' as const,
      icon: Users,
      color: 'text-muted-foreground',
      isEmpty: true
    },
    {
      title: 'GST Payable',
      value: '₹0',
      change: 'No GST due',
      trend: 'neutral' as const,
      icon: AlertCircle,
      color: 'text-muted-foreground',
      isEmpty: true
    }
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">BizTrack</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative"
            >
              <AlertCircle className="w-5 h-5" />
              {!hasData && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-muted rounded-full"></span>
              )}
            </Button>
            
            <Button variant="ghost" size="sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* Welcome Message for New Users */}
        {!hasData && (
          <div className="bg-card/40 border border-border/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to BizTrack!</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Start by going to Sales section to create your first customer and sale.
            </p>
            <Button 
              size="sm" 
              onClick={() => onSectionChange('sales')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Go to Sales
            </Button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Business Overview</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {emptyMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                color={metric.color}
                isEmpty={metric.isEmpty}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <ChartSection isEmpty={!hasData} />

        {/* Recent Activity */}
        <ActivityFeed isEmpty={!hasData} />
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <QuickActions 
        isOpen={showQuickActions}
        onToggle={() => setShowQuickActions(!showQuickActions)}
        isEmpty={!hasData}
      />

      {/* Alerts Panel */}
      <AlertsPanel 
        isOpen={showAlerts}
        onClose={() => setShowAlerts(false)}
        isEmpty={!hasData}
      />
    </div>
  );
};

export default Dashboard;
