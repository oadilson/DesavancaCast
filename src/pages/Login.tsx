"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Podcast } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast'; // Importar showError
import CustomSignInForm from '@/components/auth/CustomSignInForm';
import CustomSignUpForm from '@/components/auth/CustomSignUpForm';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'sign_up' ? 'sign_up' : 'sign_in';
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>(initialView);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setIsSigningInWithGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`, // Redireciona para a home após o login
      },
    });

    if (error) {
      showError('Erro ao fazer login com Google: ' + error.message);
      setIsSigningInWithGoogle(false);
    }
    // No need to set loading to false on success, as onAuthStateChange will handle navigation
  };

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
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 py-2 h-11 text-podcast-white border-podcast-border hover:bg-podcast-border"
              onClick={handleGoogleSignIn}
              disabled={isSigningInWithGoogle}
            >
              {isSigningInWithGoogle ? (
                <svg className="animate-spin h-5 w-5 text-podcast-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.24 10.284V11.99H18.48C18.364 12.684 18.012 13.608 17.316 14.304C16.62 15 15.696 15.648 14.64 16.224L14.64 16.236L16.068 17.388C17.808 15.708 18.96 13.476 19.2 10.284H12.24Z" fill="#4285F4"/>
                  <path d="M12.24 7.716V7.704L12.24 7.716L5.184 7.716L5.16 7.728C5.184 7.032 5.304 6.36 5.544 5.736C5.784 5.112 6.12 4.536 6.552 4.008L6.564 4.008L7.992 2.856C7.416 3.42 6.936 4.056 6.552 4.764C6.168 5.472 5.892 6.24 5.724 7.068L5.724 7.08L5.184 7.716H12.24Z" fill="#34A853"/>
                  <path d="M12.24 19.284V19.272L12.24 19.284L12.228 19.296L5.184 19.296L5.16 19.284C5.184 19.98 5.304 20.652 5.544 21.276C5.784 21.9 6.12 22.476 6.552 23.004L6.564 23.004L7.992 24.156C7.416 23.592 6.936 22.956 6.552 22.248C6.168 21.54 5.892 20.772 5.724 19.944L5.724 19.932L5.184 19.284H12.24Z" fill="#FBBC05"/>
                  <path d="M12.24 13.716V13.704L12.24 13.716L12.228 13.728L19.284 13.728L19.296 13.716C19.272 13.02 19.152 12.348 18.912 11.724C18.672 11.1 18.336 10.524 17.904 9.996L17.892 9.996L16.464 8.844C16.992 9.396 17.412 10.02 17.724 10.728C18.036 11.436 18.24 12.204 18.312 13.032L18.312 13.044L19.284 13.716H12.24Z" fill="#EA4335"/>
                </svg>
              )}
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