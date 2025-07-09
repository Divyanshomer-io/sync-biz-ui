
import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import SalesManagement from '@/components/sales/SalesManagement';
import PurchasesManagement from '@/components/purchases/PurchasesManagement';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserProfile from '@/components/auth/UserProfile';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    console.log(`Navigating to ${section} section`);
  };

  // Listen for navigation events from QuickActions
  useEffect(() => {
    const handleNavigateToSales = () => setActiveSection('sales');
    const handleNavigateToReports = () => setActiveSection('reports');
    const handleNavigateToSettings = () => setActiveSection('settings');

    window.addEventListener('navigate-to-sales', handleNavigateToSales);
    window.addEventListener('navigate-to-reports', handleNavigateToReports);
    window.addEventListener('navigate-to-settings', handleNavigateToSettings);

    return () => {
      window.removeEventListener('navigate-to-sales', handleNavigateToSales);
      window.removeEventListener('navigate-to-reports', handleNavigateToReports);
      window.removeEventListener('navigate-to-settings', handleNavigateToSettings);
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard activeSection={activeSection} onSectionChange={handleSectionChange} />;
      case 'sales':
        return <SalesManagement />;
      case 'purchases':
        return <PurchasesManagement />;
      case 'reports':
        return (
          <div className="min-h-screen bg-background pt-16 pb-20 px-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">Advanced reports coming soon...</p>
            </div>
          </div>
        );
      case 'profile':
        return <UserProfile onBack={() => setActiveSection('dashboard')} />;
      case 'settings':
        return (
          <div className="min-h-screen bg-background pt-16 pb-20 px-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard activeSection={activeSection} onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative">
        {renderContent()}
        
        {/* Fixed Bottom Navigation - Show on all sections */}
        {activeSection !== 'dashboard' && activeSection !== 'profile' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 z-50">
          <div className="flex items-center justify-around px-2 py-2">
            <button
              onClick={() => handleSectionChange('dashboard')}
              className="nav-item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => handleSectionChange('sales')}
              className={`nav-item ${activeSection === 'sales' ? 'active' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Sales</span>
            </button>
            <button
              onClick={() => handleSectionChange('purchases')}
              className={`nav-item ${activeSection === 'purchases' ? 'active' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xs font-medium">Purchases</span>
            </button>
            <button
              onClick={() => handleSectionChange('reports')}
              className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">Reports</span>
            </button>
          </div>
        </nav>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Index;
