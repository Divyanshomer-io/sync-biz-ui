
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    console.log(`Navigating to ${section} section`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard activeSection={activeSection} onSectionChange={handleSectionChange} />;
      case 'sales':
        return (
          <div className="min-h-screen bg-background pt-16 pb-20 px-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Sales Management</h1>
              <p className="text-muted-foreground">Sales features coming soon...</p>
            </div>
          </div>
        );
      case 'purchases':
        return (
          <div className="min-h-screen bg-background pt-16 pb-20 px-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Purchase Management</h1>
              <p className="text-muted-foreground">Purchase features coming soon...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="min-h-screen bg-background pt-16 pb-20 px-4 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">Advanced reports coming soon...</p>
            </div>
          </div>
        );
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

  return renderContent();
};

export default Index;
