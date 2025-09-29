import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-podcast-black text-podcast-white pb-32"> {/* Aumentado para pb-32 */}
      <div className="flex flex-grow">
        <aside className="hidden md:block w-64 flex-shrink-0 fixed top-0 left-0 h-screen">
          <Sidebar />
        </aside>
        <div className="flex flex-col flex-grow min-w-0 md:ml-64">
          <Header />
          <main className="flex-grow p-3 md:p-6 mt-20 pt-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;