"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Podcast } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CustomSignInForm from '@/components/auth/CustomSignInForm';
import CustomSignUpForm from '@/components/auth/CustomSignUpForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'sign_up' ? 'sign_up' : 'sign_in';
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
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      showError('Erro ao fazer login com Google: ' + error.message);
      setIsSigningInWithGoogle(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-podcast-black">
      {/* Painel Esquerdo (Branding) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative p-8 flex-col justify-between text-podcast-white bg-gradient-to-br from-podcast-black via-podcast-purple/30 to-podcast-green/20 animate-background-pan" style={{ backgroundSize: '200% 200%' }}>
        <div className="absolute inset-0 bg-podcast-black/50 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Podcast className="text-podcast-green" size={32} />
            <h1 className="text-2xl font-bold">DesavançaCast</h1>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center">
          <blockquote className="max-w-lg">
            <p className="text-3xl lg:text-4xl font-semibold leading-tight">"A produtividade não é sobre fazer mais, é sobre criar mais impacto com menos esforço."</p>
            <footer className="mt-4 text-lg text-podcast-gray">- Autor Desconhecido</footer>
          </blockquote>
        </div>
        <div className="relative z-10 text-xs text-podcast-gray text-center">
          © {currentYear} DesavançaCast. Todos os direitos reservados.
        </div>
      </div>

      {/* Painel Direito (Formulários) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="md:hidden flex items-center gap-3 mb-8 text-podcast-white">
          <Podcast className="text-podcast-green" size={32} />
          <h1 className="text-2xl font-bold">DesavançaCast</h1>
        </div>
        <Card className="w-full max-w-sm sm:max-w-md bg-transparent border-none shadow-none">
          <Tabs 
            defaultValue={initialView} 
            className="w-full"
            onValueChange={(value) => setSearchParams({ view: value })}
          >
            <TabsList className="grid w-full grid-cols-2 bg-podcast-black-light h-12">
              <TabsTrigger value="sign_in" className="text-base">Entrar</TabsTrigger>
              <TabsTrigger value="sign_up" className="text-base">Cadastrar</TabsTrigger>
            </TabsList>
            <CardContent className="p-6 pt-8 bg-podcast-black-light rounded-b-lg">
              <button 
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 py-2 h-11 bg-podcast-border text-podcast-white border border-podcast-border hover:bg-podcast-border/70 rounded-md text-sm font-medium disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
                <span className="bg-podcast-black-light px-2 text-podcast-gray z-10">ou</span>
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-podcast-border" />
              </div>
              <TabsContent value="sign_in">
                <CustomSignInForm />
              </TabsContent>
              <TabsContent value="sign_up">
                <CustomSignUpForm onSuccess={() => setSearchParams({ view: 'sign_in' })} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;