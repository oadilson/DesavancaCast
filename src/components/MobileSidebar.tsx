import React from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Search, Library, User, Podcast } from 'lucide-react'; // Importar Podcast
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client'; // Para verificar o status de login

const MobileSidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
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

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/search', label: 'Buscar', icon: Search },
    { path: userId ? '/library' : '/login', label: 'Biblioteca', icon: Library },
    { path: userId ? '/profile' : '/login', label: 'Perfil', icon: User }, // Mapeado de 'Configurações' para 'Perfil'
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6 text-podcast-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-podcast-black border-r-podcast-border flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b border-podcast-border">
          <SheetTitle className="flex items-center gap-2 text-podcast-white text-lg font-bold">
            <Podcast className="h-6 w-6 text-podcast-green" />
            Podcast Player
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-podcast-gray hover:text-podcast-white">
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => {
            // Para 'Biblioteca', verificar se a rota atual começa com /library, /liked, /downloads ou /recent
            const isLibraryActive = item.label === 'Biblioteca' && (
              location.pathname.startsWith('/library') ||
              location.pathname === '/liked' ||
              location.pathname === '/downloads' ||
              location.pathname === '/recent'
            );
            const isActive = location.pathname === item.path || isLibraryActive;

            return (
              <Link key={item.path} to={item.path} className="block" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-podcast-gray hover:text-podcast-white hover:bg-podcast-border rounded-lg",
                    isActive && "bg-podcast-green text-podcast-black hover:bg-podcast-green/90"
                  )}
                >
                  <item.icon className={cn("mr-2 h-5 w-5", isActive ? "text-podcast-black" : "text-podcast-green")} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;