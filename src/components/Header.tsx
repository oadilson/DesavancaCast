import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Podcast } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MobileSidebar from './MobileSidebar';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'adilsonsilva@outlook.com';

interface HeaderProps {
  className?: string;
}

interface ProfileData {
  avatar_url: string | null;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(''); // Estado para a busca global

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    const fetchProfile = async (user: User) => {
      const { data: profileDataArray, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id);

      if (error) {
        console.error('Error fetching profile for header:', error);
      } else {
        setProfile(profileDataArray?.[0] || null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      }
    });

    const { data: { subscription } = { subscription: null } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(globalSearchTerm.trim())}`);
      setGlobalSearchTerm(''); // Limpa o campo de busca após a navegação
    }
  };

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 px-4 transition-all duration-300 flex items-center justify-between",
        scrolled ? "bg-podcast-black/80 backdrop-blur-sm" : "bg-transparent",
        className
      )}
    >
      {/* Seção esquerda: Gatilho da Sidebar Mobile + Logo do Podcast (alinhado com a sidebar) */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 md:w-64">
        <MobileSidebar />
        <Link to="/" className="hidden md:flex items-center gap-2 text-podcast-white hover:text-podcast-green transition-colors ml-2">
          <Podcast className="text-podcast-green" size={24} />
        </Link>
      </div>

      {/* Conteúdo principal do cabeçalho (barra de busca e menu do usuário) - deslocado para a direita */}
      <div className="flex items-center justify-between flex-grow md:ml-64">
        {/* Barra de Busca Global */}
        <form onSubmit={handleGlobalSearch} className="relative flex-grow max-w-lg hidden md:block mx-4">
          <Input
            type="text"
            placeholder="O que você quer ouvir?"
            className="w-full bg-podcast-black-light border-none text-podcast-white placeholder:text-podcast-gray focus:ring-2 focus:ring-podcast-green/30 pr-10 rounded-full h-10 text-sm"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 text-podcast-gray hover:text-podcast-white">
            <Search className="h-5 w-5" />
          </Button>
        </form>

        {/* Seção direita: Menu do Usuário */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                     <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${session.user.email}`} alt="User Avatar" />
                    <AvatarFallback>{session.user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-podcast-black-light border-podcast-border text-podcast-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Minha Conta</p>
                    <p className="text-xs leading-none text-podcast-gray">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-podcast-border" />
                <DropdownMenuItem asChild className="cursor-pointer hover:!bg-podcast-border hover:!text-podcast-white">
                  <Link to="/profile">Perfil</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:!bg-podcast-border hover:!text-podcast-white">
                    <Link to="/admin">Administração</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive hover:!bg-podcast-border hover:!text-destructive-foreground">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login?view=sign_up">
                <Button variant="ghost" className="text-podcast-white hover:text-podcast-green hover:bg-transparent hidden sm:inline-flex">
                  Registrar
                </Button>
              </Link>
              <Link to="/login">
                <Button className="rounded-full bg-podcast-green text-podcast-black hover:bg-podcast-green/90 px-4 py-2 text-sm md:text-base">
                  Entrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;