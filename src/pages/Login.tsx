"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Podcast } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import CustomSignInForm from '@/components/auth/CustomSignInForm';
import CustomSignUpForm from '@/components/auth/CustomSignUpForm';
import { Button } from '@/components/ui/button'; // Para o botão Google placeholder

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'sign_up' ? 'sign_up' : 'sign_in';
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>(initialView);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        showSuccess('Login realizado com sucesso!');
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex">
      {/* Painel Esquerdo (Branding e Citação) - Visível apenas em telas maiores */}
      <div className="hidden md:flex md:w-1/2 bg-podcast-black-light relative p-8 flex-col justify-between text-podcast-white">
        {/* Logo/Título centralizado */}
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-podcast-green p-2 rounded-md">
              <Podcast className="text-podcast-black" size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">DesavançaCast</h1>
              <p className="text-base text-podcast-gray">Seu Podcast de Produtividade</p>
            </div>
          </div>
        </div>

        {/* Copyright no rodapé */}
        <div className="text-xs text-podcast-gray text-center">
          © {currentYear} DesavançaCast
        </div>
      </div>

      {/* Painel Direito (Formulários de Autenticação) */}
      <div className="w-full md:w-1/2 bg-podcast-black flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-sm sm:max-w-md bg-podcast-black-light border-podcast-border shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="text-center pt-6">
            <CardTitle className="text-3xl font-bold text-podcast-white">
              {authView === 'sign_in' ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
            </CardTitle>
            <p className="text-podcast-gray mt-2">
              {authView === 'sign_in'
                ? 'Bem-vindo de volta! Faça login para continuar.'
                : 'Comece sua jornada na produtividade caótica hoje mesmo.'}
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {/* Placeholder para o botão Google */}
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-2 h-11 text-podcast-white border-podcast-border hover:bg-podcast-border">
              {/* Se você tiver um ícone do Google, pode adicioná-lo aqui */}
              Continuar com Google
            </Button>
            <div className="relative flex justify-center text-xs uppercase my-6">
              <span className="bg-podcast-black-light px-2 text-podcast-gray">ou</span>
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-podcast-border" />
            </div>

            {authView === 'sign_in' ? (
              <CustomSignInForm onSwitchToSignUp={() => setAuthView('sign_up')} />
            ) : (
              <CustomSignUpForm onSwitchToSignIn={() => setAuthView('sign_in')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;