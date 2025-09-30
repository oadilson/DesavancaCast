"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Podcast } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
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
            <button 
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-2 h-11 
                         bg-podcast-border text-podcast-white border border-podcast-border 
                         hover:bg-podcast-border/70 rounded-md text-sm font-medium
                         disabled:opacity-50 disabled:pointer-events-none transition-colors"
              onClick={handleGoogleSignIn}
              disabled={isSigningInWithGoogle}
            >
              {isSigningInWithGoogle ? (
                <svg className="animate-spin h-5 w-5 text-podcast-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                  <g>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h13.01c-.59 3.41-2.36 6.32-5.21 8.25l7.44 5.79c4.4-4.04 6.97-10.02 6.97-17.99z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.44-5.79c-2.15 1.45-4.92 2.3-8.45 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                  </g>
                </svg>
              )}
              Continuar com Google
            </button>
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