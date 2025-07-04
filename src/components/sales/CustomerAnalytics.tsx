
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

interface CustomerAnalyticsProps {
  customer: any;
}

const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ customer }) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Monthly Sales Trend */}
          <div className="bg-card/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Monthly Trend</span>
            </div>
            <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5 rounded flex items-end justify-center">
              <div className="text-xs text-muted-foreground">Chart coming soon</div>
            </div>
          </div>

          {/* Payment Ratio */}
          <div className="bg-card/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Payment Ratio</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round((customer.totalPaid / customer.totalSales) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Paid vs Total</div>
            </div>
          </div>

          {/* Average Invoice */}
          <div className="bg-card/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Avg Invoice</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">
                ₹{Math.round(customer.totalSales / 3).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Per Invoice</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Invoice Frequency</div>
              <div className="text-lg font-semibold text-foreground">Monthly</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Preferred Unit</div>
              <div className="text-lg font-semibold text-foreground">{customer.unitPreference}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAnalytics;
