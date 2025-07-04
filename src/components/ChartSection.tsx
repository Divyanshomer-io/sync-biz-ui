
import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, PieChart as PieChartIcon } from 'lucide-react';

const ChartSection: React.FC = () => {
  const [activeChart, setActiveChart] = useState('sales');

  // Sample business data
  const salesData = [
    { month: 'Jan', sales: 185000, purchases: 120000 },
    { month: 'Feb', sales: 195000, purchases: 135000 },
    { month: 'Mar', sales: 220000, purchases: 155000 },
    { month: 'Apr', sales: 245000, purchases: 185000 },
    { month: 'May', sales: 265000, purchases: 195000 },
    { month: 'Jun', sales: 285000, purchases: 205000 }
  ];

  const customerData = [
    { name: 'ABC Industries', amount: 95000, transactions: 12 },
    { name: 'XYZ Trading', amount: 78000, transactions: 8 },
    { name: 'PQR Manufacturing', amount: 65000, transactions: 15 },
    { name: 'LMN Enterprises', amount: 52000, transactions: 6 },
    { name: 'RST Solutions', amount: 45000, transactions: 9 }
  ];

  const paymentStatusData = [
    { name: 'Paid', value: 198000, color: '#10B981' },
    { name: 'Pending', value: 47000, color: '#F59E0B' },
    { name: 'Overdue', value: 15000, color: '#EF4444' }
  ];

  const chartTypes = [
    { id: 'sales', label: 'Sales Trend', icon: TrendingUp },
    { id: 'customers', label: 'Top Customers', icon: Users },
    { id: 'payments', label: 'Payment Status', icon: PieChartIcon }
  ];

  const renderChart = () => {
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
              <XAxis dataKey="month" stroke="#9CA3AF" />
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
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={customerData} layout="horizontal">
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
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
      </div>

      <Card className="chart-container">
        {renderChart()}
      </Card>
    </section>
  );
};

export default ChartSection;
