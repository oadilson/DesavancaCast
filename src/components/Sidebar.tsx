import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Heart, Podcast, ListMusic, TrendingUp, Calendar, Download, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getPodcastForDisplay } from '@/data/podcastData';

const ADMIN_EMAIL = 'adilsonsilva@outlook.com'; // Definir o email do administrador

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Fetch podcast data for display in sidebar
  const { data: myPodcast, isLoading: isLoadingPodcast } = useQuery({
    queryKey: ['sidebarPodcastDisplay'],
    queryFn: getPodcastForDisplay,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/episodes', label: 'Episódios', icon: ListMusic },
    { path: '/popular', label: 'Populares', icon: TrendingUp },
    { path: '/releases', label: 'Lançamentos', icon: Calendar },
  ];

  const libraryItems = [
    { path: '/liked', label: 'Curtidos', icon: Heart },
    { path: '/downloads', label: 'Downloads', icon: Download },
    { path: '/recent', label: 'Histórico', icon: History },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-podcast-black text-podcast-gray px-8 py-4", className)}>
      <div className="mb-6">
        {!isLoadingPodcast && myPodcast && (
          <Link to="/" className="flex items-center gap-3 mb-6">
            {/* Substituído a imagem pela Podcast icon */}
            <Podcast className="h-10 w-10 text-podcast-green" /> 
            <span className="text-lg font-bold text-podcast-white">{myPodcast.title}</span>
          </Link>
        )}
      </div>

      <nav className="flex-grow space-y-4">
        <h3 className="text-xs uppercase text-podcast-gray font-semibold mb-2">NAVEGAR</h3>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-podcast-gray hover:text-podcast-white hover:bg-podcast-black-light rounded-lg",
                    isActive && "bg-podcast-black-light text-podcast-white"
                  )}
                >
                  <item.icon className={cn("mr-2 h-5 w-5", isActive && "text-podcast-green")} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <h3 className="text-xs uppercase text-podcast-gray font-semibold mt-6 mb-2">SUA BIBLIOTECA</h3>
        <div className="space-y-1">
          {libraryItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-podcast-gray hover:text-podcast-white hover:bg-podcast-black-light rounded-lg",
                    isActive && "bg-podcast-black-light text-podcast-white"
                  )}
                >
                  <item.icon className={cn("mr-2 h-5 w-5", isActive && "text-podcast-green")} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        
        {!loadingAuth && isAdmin && (
          <div className="space-y-1 border-t border-podcast-border pt-4 mt-4">
            <Link to="/admin" className="block">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-podcast-gray hover:text-podcast-white hover:bg-podcast-black-light rounded-lg",
                  location.pathname === '/admin' && "bg-podcast-black-light text-podcast-white"
                )}
              >
                <Settings className={cn("mr-2 h-5 w-5", location.pathname === '/admin' && "text-podcast-green")} />
                Administrador
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;