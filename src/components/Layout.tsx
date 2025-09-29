"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-podcast-black text-podcast-white"> {/* Removido pb-32 daqui */}
      <div className="flex flex-grow">
        <aside className="hidden md:block w-64 flex-shrink-0 fixed top-20 left-0 bottom-32 overflow-y-auto"> {/* Ajustado top e bottom */}
          <Sidebar />
        </aside>
        <div className="flex flex-col flex-grow min-w-0 md:ml-64">
          <Header />
          <main className="flex-grow p-3 md:p-6 mt-20 pt-8 overflow-y-auto pb-32"> {/* Adicionado pb-32 aqui */}
            {children}
          </main>
        </div>
      </div>
      <Footer className="relative z-40" /> {/* Adicionado z-index ao Footer */}
    </div>
  );
};

export default Layout;