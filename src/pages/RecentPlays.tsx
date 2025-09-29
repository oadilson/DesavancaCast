import React from 'react';
import Layout from '@/components/Layout';
import { History, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RecentPlays: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 sm:py-10 px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
          <History className="mr-3 h-7 w-7 text-podcast-green" />
          Reproduzidos Recentemente
        </h1>
        <Alert className="bg-podcast-purple/20 border-podcast-purple text-podcast-white mb-6">
          <Info className="h-4 w-4 !text-podcast-white" />
          <AlertTitle className="text-sm">Em Desenvolvimento</AlertTitle>
          <AlertDescription className="text-xs">
            Esta seção exibirá seu histórico de reprodução em breve.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
          <History className="h-12 w-12 mb-4 text-podcast-gray" />
          <p className="text-lg font-bold mb-2">Nenhum histórico de reprodução</p>
          <p className="text-sm text-podcast-gray text-center">
            Comece a ouvir para ver seu histórico aqui.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RecentPlays;