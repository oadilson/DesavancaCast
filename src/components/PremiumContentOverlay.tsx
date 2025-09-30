import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumContentOverlayProps {
  children: React.ReactNode;
  isPremiumEpisode: boolean;
  hasPremiumSubscription: boolean;
}

const PremiumContentOverlay: React.FC<PremiumContentOverlayProps> = ({
  children,
  isPremiumEpisode,
  hasPremiumSubscription,
}) => {
  const navigate = useNavigate();

  if (!isPremiumEpisode || hasPremiumSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-md pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-podcast-black-light/80 backdrop-blur-sm rounded-lg p-4 text-center">
        <Crown className="h-12 w-12 text-yellow-400 mb-4" />
        <h3 className="text-2xl font-bold text-podcast-white mb-2">Conteúdo Premium</h3>
        <p className="text-podcast-gray mb-6">
          Este conteúdo é exclusivo para assinantes Premium.
        </p>
        <Button
          onClick={() => navigate('/premium')}
          className="bg-podcast-green text-podcast-black hover:bg-podcast-green/90 rounded-full px-6 py-3 text-base font-semibold shadow-podcast-glow"
        >
          Assinar Premium
        </Button>
      </div>
    </div>
  );
};

export default PremiumContentOverlay;