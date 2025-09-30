import React from 'react';
import { Link } from 'react-router-dom';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { History, Heart, Download, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibraryCardsProps {
  userId: string | null;
  isAdmin: boolean;
  className?: string;
}

const LibraryCards: React.FC<LibraryCardsProps> = ({ userId, isAdmin, className }) => {
  const libraryCardsData = [
    {
      title: 'Ouvidos Recentemente',
      description: 'Continue de onde parou',
      icon: History,
      bgColor: 'bg-podcast-green',
      hoverBgColor: 'hover:bg-podcast-green/90',
      path: userId ? '/recent' : '/login',
    },
    {
      title: 'Favoritos',
      description: 'Seus episódios salvos',
      icon: Heart,
      bgColor: 'bg-podcast-purple',
      hoverBgColor: 'hover:bg-podcast-purple/90',
      path: userId ? '/liked' : '/login',
    },
    {
      title: 'Downloads',
      description: 'Ouça offline',
      icon: Download,
      bgColor: 'bg-blue-600',
      hoverBgColor: 'hover:bg-blue-700',
      path: userId ? '/downloads' : '/login',
    },
    {
      title: 'Estatísticas',
      description: 'Seu tempo de escuta',
      icon: BarChart2,
      bgColor: 'bg-orange-600',
      hoverBgColor: 'hover:bg-orange-700',
      path: isAdmin ? '/admin' : '/login',
      disabled: !isAdmin && !userId,
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {libraryCardsData.map((card, index) => (
        <Link
          key={index}
          to={card.path}
          className={cn(
            "block rounded-xl p-6 text-podcast-white transition-colors shadow-lg",
            card.bgColor,
            card.hoverBgColor,
            card.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <card.icon className="h-8 w-8 mb-3" />
          <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
          <CardDescription className="text-sm text-white/80 mt-1">{card.description}</CardDescription>
        </Link>
      ))}
    </div>
  );
};

export default LibraryCards;