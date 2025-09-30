import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav'; // Importar o novo componente
import { useIsMobile } from '@/hooks/use-mobile'; // Importar o hook

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  // A altura estimada do cabeçalho no desktop é de aproximadamente 72px (h-10 para input + 2*py-4)
  const headerHeight = '72px'; 
  // Altura do player fixo (64px) + altura da barra de navegação inferior (64px + 24px do copyright)
  const bottomNavAndPlayerHeight = isMobile ? '152px' : '96px'; // Player (64px) + MobileNav (64px + 24px) = 152px; Player (64px) + Footer (32px) = 96px

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
          <main className="flex-grow py-4 md:py-8 px-4 md:px-12 overflow-y-auto" style={{ paddingBottom: bottomNavAndPlayerHeight }}> {/* Ajustado padding horizontal e padding-bottom */}
            {children}
          </main>
        </div>
      </div>
      {!isMobile && <Footer className="relative z-40" />} {/* Footer visível apenas no desktop */}
      {isMobile && <MobileBottomNav />} {/* MobileBottomNav visível apenas no mobile */}
    </div>
  );
};

export default Layout;