import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Settings, Heart, Download, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useLikedEpisodes } from '@/hooks/use-liked-episodes';
import { useDownloadContext } from '@/context/DownloadContext';

const MobileBottomNav: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isMobile) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/search', label: 'Buscar', icon: Search },
    { path: '/profile', label: 'Configurações', icon: Settings },
  ];

  // A 'Biblioteca' será um dropdown ou uma página que agrega Curtidos, Downloads, Histórico.
  // Por enquanto, vamos direcionar para /liked como um placeholder para 'Biblioteca'.
  // Em uma implementação mais completa, 'Biblioteca' poderia ser uma página com sub-navegação.
  const libraryPath = userId ? '/liked' : '/login'; // Redireciona para login se não estiver logado

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-podcast-black-light border-t border-podcast-border text-podcast-gray flex flex-col">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center text-xs font-medium flex-1 h-full">
              <item.icon className={cn("h-6 w-6 mb-1 transition-colors", isActive ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")} />
              <span className={cn("transition-colors", isActive ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* Item da Biblioteca */}
        <Link to={libraryPath} className="flex flex-col items-center justify-center text-xs font-medium flex-1 h-full">
          <Library className={cn("h-6 w-6 mb-1 transition-colors", location.pathname === '/liked' || location.pathname === '/downloads' || location.pathname === '/recent' ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")} />
          <span className={cn("transition-colors", location.pathname === '/liked' || location.pathname === '/downloads' || location.pathname === '/recent' ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")}>
            Biblioteca
          </span>
        </Link>
      </nav>
      <div className="text-xs text-podcast-gray text-center py-1 border-t border-podcast-border/50">
        DesavançaCast © • {currentYear}
      </div>
    </div>
  );
};

export default MobileBottomNav;