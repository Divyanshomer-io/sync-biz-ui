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
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MetricCard from './MetricCard';
import ChartSection from './ChartSection';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import AlertsPanel from './AlertsPanel';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { usePayments } from '@/hooks/usePayments';

interface DashboardProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

type TimeFilter = '1week' | '1month' | '1year';

const Dashboard: React.FC<DashboardProps> = ({ activeSection, onSectionChange }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1month');
  
  // Get real data from hooks with real-time updates
  const { customers, refetch: refetchCustomers } = useCustomers();
  const { sales, refetch: refetchSales } = useSales();
  const { payments, refetch: refetchPayments } = usePayments();

  // Set up real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCustomers();
      refetchSales();
      refetchPayments();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetchCustomers, refetchSales, refetchPayments]);

  const getFilteredData = (timeFilter: TimeFilter) => {
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case '1week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate;
    });

    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.created_at);
      return paymentDate >= startDate;
    });

    return { filteredSales, filteredPayments };
  };

  const { filteredSales, filteredPayments } = getFilteredData(timeFilter);

  // Calculate metrics from filtered data
  const totalCustomers = customers.length;
  const totalSales = customers.reduce((sum, customer) => sum + (customer.totalSales || 0), 0);
  const totalPaid = customers.reduce((sum, customer) => sum + (customer.totalPaid || 0), 0);
  const totalPending = customers.reduce((sum, customer) => sum + (customer.pending || 0), 0);
  
  // Calculate filtered period sales and payments
  const periodSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const periodPayments = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);

  const hasData = totalCustomers > 0 || sales.length > 0;

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case '1week': return 'This Week';
      case '1month': return 'This Month';
      case '1year': return 'This Year';
      default: return 'This Month';
    }
  };

  const metrics = [
    {
      title: `Sales ${getTimeFilterLabel(timeFilter)}`,
      value: `₹${periodSales.toLocaleString()}`,
      change: hasData ? getTimeFilterLabel(timeFilter) : 'Start selling',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: TrendingUp,
      color: hasData ? 'text-green-500' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Total Sales', 
      value: `₹${totalSales.toLocaleString()}`,
      change: hasData ? 'All time' : 'No sales yet',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: DollarSign,
      color: hasData ? 'text-blue-500' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Payments Received',
      value: `₹${totalPaid.toLocaleString()}`,
      change: hasData ? `₹${periodPayments.toLocaleString()} ${getTimeFilterLabel(timeFilter).toLowerCase()}` : 'No payments yet',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: DollarSign,
      color: hasData ? 'text-green-500' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Outstanding Dues',
      value: `₹${totalPending.toLocaleString()}`,
      change: totalPending > 0 ? 'Pending collection' : 'No dues pending',
      trend: totalPending > 0 ? 'down' as const : 'neutral' as const,
      icon: TrendingDown,
      color: totalPending > 0 ? 'text-red-400' : 'text-muted-foreground',
      isEmpty: !hasData
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      change: hasData ? 'Active customers' : 'Add customers',
      trend: hasData ? 'up' as const : 'neutral' as const,
      icon: Users,
      color: hasData ? 'text-primary' : 'text-muted-foreground',
      isEmpty: !hasData
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

  const timeFilterOptions = [
    { id: '1week' as TimeFilter, label: '1 Week' },
    { id: '1month' as TimeFilter, label: '1 Month' },
    { id: '1year' as TimeFilter, label: '1 Year' }
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Business Overview</h2>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex bg-card/40 rounded-lg p-1">
                {timeFilterOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={timeFilter === option.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeFilter(option.id)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
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
                isEmpty={metric.isEmpty}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
            <div className="flex bg-card/40 rounded-lg p-1">
              {timeFilterOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={timeFilter === option.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeFilter(option.id)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <ChartSection 
            isEmpty={!hasData} 
            timeFilter={timeFilter}
            sales={sales}
            payments={payments}
            customers={customers}
          />
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <div className="flex bg-card/40 rounded-lg p-1">
              {timeFilterOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={timeFilter === option.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeFilter(option.id)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <ActivityFeed isEmpty={!hasData} timeFilter={timeFilter} sales={filteredSales} payments={filteredPayments} />
        </section>
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
