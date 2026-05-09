import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-x-hidden">
      {/* ATMOSPHERIC DECOR */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-10 translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <Navbar />
      <div className="flex pt-20 flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 w-full px-6 sm:px-10 md:px-16 py-12 lg:ml-72 mb-24 lg:mb-0">
          <div className="max-w-[1700px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
