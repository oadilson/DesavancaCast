import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Headphones } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Premium: React.FC = () => {
  const handleSubscribeClick = () => {
    showSuccess('Funcionalidade de assinatura em breve!');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10"> {/* Removido container e px classes */}
        <Card className="bg-podcast-black-light border-podcast-border text-podcast-white shadow-lg rounded-xl text-center">
          <CardHeader>
            <div className="mx-auto bg-yellow-500/20 rounded-full p-3 w-fit mb-4">
              <Crown className="h-8 w-8 text-yellow-400" />
            </div>
            <CardTitle className="text-4xl font-bold">DesavançaCast Premium</CardTitle>
            <CardDescription className="text-lg text-podcast-gray mt-2">
              Tenha acesso a conteúdo exclusivo e apoie o podcast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-podcast-green mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Episódios Exclusivos</h3>
                  <p className="text-sm text-podcast-gray">Ouça episódios especiais disponíveis apenas para assinantes.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Headphones className="h-5 w-5 text-podcast-green mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Ouça Offline</h3>
                  <p className="text-sm text-podcast-gray">Baixe qualquer episódio para ouvir onde e quando quiser.</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubscribeClick}
              className="w-full sm:w-auto bg-podcast-green text-podcast-black hover:bg-podcast-green/90 rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-podcast-glow"
            >
              Assinar Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Premium;