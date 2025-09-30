import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react'; // Changed Settings to User
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

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
  ];

  // 'Biblioteca' will link to /library now.
  const libraryPath = userId ? '/library' : '/login';
  const profilePath = userId ? '/profile' : '/login'; // Profile also redirects to login if not authenticated

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
          <Library className={cn("h-6 w-6 mb-1 transition-colors", location.pathname.startsWith('/library') || location.pathname === '/liked' || location.pathname === '/downloads' || location.pathname === '/recent' ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")} />
          <span className={cn("transition-colors", location.pathname.startsWith('/library') || location.pathname === '/liked' || location.pathname === '/downloads' || location.pathname === '/recent' ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")}>
            Biblioteca
          </span>
        </Link>
        {/* Item do Perfil */}
        <Link to={profilePath} className="flex flex-col items-center justify-center text-xs font-medium flex-1 h-full">
          <User className={cn("h-6 w-6 mb-1 transition-colors", location.pathname === '/profile' ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")} />
          <span className={cn("transition-colors", location.pathname === '/profile' ? "text-podcast-green" : "text-podcast-gray group-hover:text-podcast-white")}>
            Perfil
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