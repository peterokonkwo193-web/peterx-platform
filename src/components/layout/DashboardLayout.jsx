import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex pt-20 flex-1">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 md:px-12 py-8 lg:ml-64 mb-24 lg:mb-0">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
