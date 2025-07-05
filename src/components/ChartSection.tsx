
import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, PieChart as PieChartIcon } from 'lucide-react';

interface ChartSectionProps {
  isEmpty?: boolean;
  timeFilter?: string;
  sales?: any[];
  payments?: any[];
  customers?: any[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ 
  isEmpty = false, 
  timeFilter = '1month',
  sales = [],
  payments = [],
  customers = []
}) => {
  const [activeChart, setActiveChart] = useState('sales');

  // Generate real data based on actual sales and payments
  const generateRealData = (filter: string) => {
    const now = new Date();
    let periods: string[] = [];
    let startDate: Date;

    switch (filter) {
      case '1week':
        periods = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // 1month
        periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return periods.map((period, index) => {
      let periodStart: Date;
      let periodEnd: Date;

      if (filter === '1week') {
        periodStart = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
        periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
      } else if (filter === '1year') {
        periodStart = new Date(now.getFullYear(), index, 1);
        periodEnd = new Date(now.getFullYear(), index + 1, 0);
      } else {
        periodStart = new Date(startDate.getTime() + index * 7 * 24 * 60 * 60 * 1000);
        periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      // Only include data up to current date
      if (periodStart > now) {
        return { period, sales: 0, purchases: 0 };
      }

      const periodSales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= periodStart && saleDate < periodEnd;
      }).reduce((sum, sale) => sum + Number(sale.total_amount), 0);

      const periodPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= periodStart && paymentDate < periodEnd;
      }).reduce((sum, payment) => sum + Number(payment.amount_paid), 0);

      return {
        period,
        sales: periodSales,
        purchases: periodPayments
      };
    });
  };

  const salesData = generateRealData(timeFilter);

  // Real customer data - top 5 customers by sales
  const topCustomers = customers
    .filter(customer => (customer.totalSales || 0) > 0)
    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
    .slice(0, 5)
    .map(customer => ({
      name: customer.name,
      amount: customer.totalSales || 0,
      transactions: sales.filter(sale => sale.customer_id === customer.id).length
    }));

  // Real payment status data
  const totalSales = customers.reduce((sum, customer) => sum + (customer.totalSales || 0), 0);
  const totalPaid = customers.reduce((sum, customer) => sum + (customer.totalPaid || 0), 0);
  const totalPending = customers.reduce((sum, customer) => sum + (customer.pending || 0), 0);

  const paymentStatusData = [
    { name: 'Paid', value: totalPaid, color: '#10B981' },
    { name: 'Pending', value: totalPending, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  const chartTypes = [
    { id: 'sales', label: 'Sales Trend', icon: TrendingUp },
    { id: 'customers', label: 'Top Customers', icon: Users },
    { id: 'payments', label: 'Payment Status', icon: PieChartIcon }
  ];

  const renderChart = () => {
    if (isEmpty) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-4xl opacity-50">📊</div>
            <p>Charts will appear once you have data</p>
          </div>
        </div>
      );
    }

    switch (activeChart) {
      case 'sales':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#0EA5E9" 
                fillOpacity={1} 
                fill="url(#salesGradient)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="purchases" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#purchasesGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'customers':
        if (topCustomers.length === 0) {
          return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="text-4xl opacity-50">👥</div>
                <p>No customer data available</p>
              </div>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCustomers} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="amount" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'payments':
        if (paymentStatusData.length === 0) {
          return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="text-4xl opacity-50">💳</div>
                <p>No payment data available</p>
              </div>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {chartTypes.map((chart) => (
          <Button
            key={chart.id}
            variant={activeChart === chart.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveChart(chart.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <chart.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{chart.label}</span>
          </Button>
        ))}
      </div>

      <Card className="chart-container">
        {renderChart()}
      </Card>
    </div>
  );
};

export default ChartSection;
