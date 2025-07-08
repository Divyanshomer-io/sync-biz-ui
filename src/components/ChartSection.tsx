import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, PieChart as PieChartIcon } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, addDays, addMonths } from 'date-fns';

interface ChartSectionProps {
  isEmpty?: boolean;
  timeFilter?: string;
  sales?: any[];
  payments?: any[];
  customers?: any[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ 
  isEmpty = false, 
  timeFilter = '1month', // Default to 1month (now 30 days)
  sales = [],
  payments = [],
  customers = []
}) => {
  const [activeChart, setActiveChart] = useState('sales');

  const generateRealData = (filter: string) => {
    const now = new Date();
    let dataPoints: { period: string; sales: number; purchases: number }[] = [];

    if (filter === '1week') {
      // Data for last 7 days (including today)
      for (let i = 6; i >= 0; i--) { // Loop for the last 7 days
        const date = subDays(now, i);
        const period = format(date, 'MMM dd'); // e.g., 'Jul 01'
        dataPoints.push({ period, sales: 0, purchases: 0 });
      }
    } else if (filter === '1year') {
      // Data for last 12 months (including current month)
      for (let i = 11; i >= 0; i--) { // Loop for the last 12 months
        const monthStart = startOfMonth(subMonths(now, i));
        const period = format(monthStart, 'MMM yyyy'); // e.g., 'Jul 2024'
        dataPoints.push({ period, sales: 0, purchases: 0 });
      }
    } else { // '1month' (now 30 days)
      // Data for last 30 days (including today)
      for (let i = 29; i >= 0; i--) { // Loop for the last 30 days
        const date = subDays(now, i);
        const period = format(date, 'MMM dd'); // e.g., 'Jul 01'
        dataPoints.push({ period, sales: 0, purchases: 0 });
      }
    }

    // Convert sales and payments created_at to Date objects for easier comparison
    const parsedSales = sales.map(sale => ({
      ...sale,
      created_at: new Date(sale.created_at)
    }));
    const parsedPayments = payments.map(payment => ({
      ...payment,
      created_at: new Date(payment.created_at)
    }));

    // Populate dataPoints with actual sales and purchases
    dataPoints.forEach(dataPoint => {
      let periodStart: Date;
      let periodEnd: Date;

      if (filter === '1week' || filter === '1month') {
        // For daily filters, the period string directly corresponds to the day
        periodStart = new Date(now.getFullYear(), now.getMonth(), parseInt(dataPoint.period.substring(4)));
        // Adjust year if month is different (e.g., Dec to Jan)
        if (dataPoint.period.substring(0,3) !== format(now, 'MMM')) {
            // This is a simplified approach. A more robust one would involve parsing the full date.
            // For now, let's just use the date-fns functions to get the exact start and end of the period.
            const dateFromPeriod = new Date(dataPoint.period + ' ' + now.getFullYear()); // Assuming current year for simplicity
            if (dateFromPeriod > now) { // Handle cases where month wraps around to previous year
                dateFromPeriod.setFullYear(now.getFullYear() - 1);
            }
            periodStart = dateFromPeriod;
        } else {
            periodStart = new Date(now.getFullYear(), now.getMonth(), parseInt(dataPoint.period.substring(4)));
        }
        // Correctly determine periodStart based on the formatted string
        // This is a more robust way to get the exact date from the 'MMM dd' string
        const yearForPeriod = now.getFullYear(); // Assume current year for daily periods
        const monthIndex = new Date(Date.parse(dataPoint.period.substring(0, 3) + " 1, 2000")).getMonth();
        const day = parseInt(dataPoint.period.substring(4));
        periodStart = new Date(yearForPeriod, monthIndex, day);
        periodEnd = addDays(periodStart, 1); // End of the day
        
        // Adjust periodStart to be the correct date in the past
        // Find the actual date object for this period
        let actualDate: Date | null = null;
        if (filter === '1week') {
            for (let i = 0; i < 7; i++) {
                const d = subDays(now, i);
                if (format(d, 'MMM dd') === dataPoint.period) {
                    actualDate = d;
                    break;
                }
            }
        } else { // 1month (30 days)
            for (let i = 0; i < 30; i++) {
                const d = subDays(now, i);
                if (format(d, 'MMM dd') === dataPoint.period) {
                    actualDate = d;
                    break;
                }
            }
        }
        if (actualDate) {
            periodStart = actualDate;
            periodEnd = addDays(actualDate, 1);
        } else {
            // Fallback for safety, though should not be hit with correct logic
            periodStart = new Date(0); 
            periodEnd = new Date(0);
        }

      } else { // '1year'
        // For monthly filter, the period string is 'MMM yyyy'
        const [monthStr, yearStr] = dataPoint.period.split(' ');
        const monthIndex = new Date(Date.parse(monthStr + " 1, 2000")).getMonth(); // Get month index from string
        const year = parseInt(yearStr);
        periodStart = new Date(year, monthIndex, 1); // First day of the month
        periodEnd = addMonths(periodStart, 1); // First day of the next month
      }

      const periodSales = parsedSales.filter(sale => {
        return sale.created_at >= periodStart && sale.created_at < periodEnd;
      }).reduce((sum, sale) => sum + Number(sale.total_amount), 0);

      const periodPayments = parsedPayments.filter(payment => {
        return payment.created_at >= periodStart && payment.created_at < periodEnd;
      }).reduce((sum, payment) => sum + Number(payment.amount_paid), 0);

      dataPoint.sales = periodSales;
      dataPoint.purchases = periodPayments;
    });

    return dataPoints;
  };

  const salesData = generateRealData(timeFilter);

  // Improved top customers data with better visualization
  const topCustomers = customers
    .filter(customer => (customer.totalSales || 0) > 0)
    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
    .slice(0, 6) // Show top 6 customers
    .map((customer, index) => ({
      name: customer.name.length > 10 ? customer.name.substring(0, 10) + '...' : customer.name,
      fullName: customer.name,
      amount: customer.totalSales || 0,
      transactions: sales.filter(sale => sale.customer_id === customer.id).length,
      color: ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'][index]
    }));

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
          <div className="h-80 flex flex-col">
            {/* Pie Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCustomers}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {topCustomers.map((entry, index) => (
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
                    formatter={(value: number, name: string, props: any) => [
                      `₹${value.toLocaleString()}`,
                      props.payload.fullName
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 px-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: customer.color }}
                  />
                  <span className="text-foreground font-medium truncate" title={customer.fullName}>
                    {customer.name}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    ₹{(customer.amount / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </div>
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
