
import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, PieChart as PieChartIcon } from 'lucide-react';

interface ChartSectionProps {
  isEmpty?: boolean;
  timeFilter?: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({ isEmpty = false, timeFilter = '1month' }) => {
  const [activeChart, setActiveChart] = useState('sales');

  // Generate sample data based on time filter
  const generateSampleData = (filter: string) => {
    switch (filter) {
      case '1week':
        return [
          { period: 'Mon', sales: 15000, purchases: 8000 },
          { period: 'Tue', sales: 12000, purchases: 6000 },
          { period: 'Wed', sales: 18000, purchases: 10000 },
          { period: 'Thu', sales: 22000, purchases: 12000 },
          { period: 'Fri', sales: 25000, purchases: 15000 },
          { period: 'Sat', sales: 20000, purchases: 11000 },
          { period: 'Sun', sales: 16000, purchases: 9000 }
        ];
      case '1year':
        return [
          { period: 'Jan', sales: 185000, purchases: 120000 },
          { period: 'Feb', sales: 195000, purchases: 135000 },
          { period: 'Mar', sales: 220000, purchases: 155000 },
          { period: 'Apr', sales: 245000, purchases: 185000 },
          { period: 'May', sales: 265000, purchases: 195000 },
          { period: 'Jun', sales: 285000, purchases: 205000 },
          { period: 'Jul', sales: 295000, purchases: 215000 },
          { period: 'Aug', sales: 310000, purchases: 225000 },
          { period: 'Sep', sales: 320000, purchases: 235000 },
          { period: 'Oct', sales: 335000, purchases: 245000 },
          { period: 'Nov', sales: 350000, purchases: 255000 },
          { period: 'Dec', sales: 365000, purchases: 265000 }
        ];
      default: // 1month
        return [
          { period: 'Week 1', sales: 65000, purchases: 45000 },
          { period: 'Week 2', sales: 72000, purchases: 48000 },
          { period: 'Week 3', sales: 68000, purchases: 52000 },
          { period: 'Week 4', sales: 75000, purchases: 55000 }
        ];
    }
  };

  const salesData = generateSampleData(timeFilter);

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
