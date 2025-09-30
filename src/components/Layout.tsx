import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // A altura estimada do cabeçalho no desktop é de aproximadamente 72px (h-10 para input + 2*py-4)
  const headerHeight = '72px'; 

  return (
    <div className="flex flex-col min-h-screen bg-podcast-black text-podcast-white">
      <Header /> {/* Header movido para o topo, fora da estrutura flex principal */}
      <div className="flex flex-grow">
        <aside 
          className="hidden md:block w-64 flex-shrink-0 fixed left-0 bottom-32 overflow-y-auto"
          style={{ top: headerHeight }} // Ajusta o topo da sidebar para começar abaixo do header
        >
          <Sidebar />
        </aside>
        <div 
          className="flex flex-col flex-grow min-w-0 md:ml-64"
          style={{ paddingTop: headerHeight }} // Adiciona padding-top para o conteúdo principal começar abaixo do header
        >
          <main className="flex-grow p-3 md:p-6 pt-8 overflow-y-auto pb-32"> {/* Removido mt-20, agora controlado por paddingTop no pai */}
            {children}
          </main>
        </div>
      </div>
      <Footer className="relative z-40" />
    </div>
  );
};

export default Layout;