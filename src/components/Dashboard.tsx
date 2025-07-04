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
  Plus,
  Receipt,
  CreditCard,
  UserPlus
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

  // Sample business metrics data
  const metrics = [
    {
      title: 'Sales This Month',
      value: '₹2,45,000',
      change: '+12.5%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Purchases This Month', 
      value: '₹1,85,000',
      change: '+8.2%',
      trend: 'up' as const,
      icon: Package,
      color: 'text-blue-400'
    },
    {
      title: 'Payments Received',
      value: '₹1,98,000',
      change: '+15.3%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Outstanding Dues',
      value: '₹47,000',
      change: '-5.8%',
      trend: 'down' as const,
      icon: TrendingDown,
      color: 'text-red-400'
    },
    {
      title: 'Total Customers',
      value: '148',
      change: '+3',
      trend: 'up' as const,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'GST Payable',
      value: '₹18,500',
      change: 'Due in 5 days',
      trend: 'neutral' as const,
      icon: AlertCircle,
      color: 'text-yellow-400'
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
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* KPI Metrics Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Business Overview</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                color={metric.color}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <ChartSection />

        {/* Recent Activity */}
        <ActivityFeed />
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
      />

      {/* Alerts Panel */}
      <AlertsPanel 
        isOpen={showAlerts}
        onClose={() => setShowAlerts(false)}
      />
    </div>
  );
};

export default Dashboard;
