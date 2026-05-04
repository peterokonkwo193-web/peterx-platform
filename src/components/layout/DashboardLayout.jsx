import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AIAssistant from '../common/AIAssistant';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 px-6 md:px-12 py-8 md:ml-64">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;
