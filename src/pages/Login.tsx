import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Podcast, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'sign_up' ? 'sign_up' : 'sign_in';
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>(initialView);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        showSuccess('Login realizado com sucesso!');
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAdminLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'adilsonsilva@outlook.com',
      password: 'admin',
    });

    if (error) {
      showError('Falha no login de admin. Verifique se o usuário adilsonsilva@outlook.com foi criado com a senha "admin".');
    }
    // O sucesso é tratado pelo onAuthStateChange
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-podcast-black to-podcast-black-light p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20 blur-sm"></div>
      <Card className="w-full max-w-sm sm:max-w-md bg-podcast-black/90 backdrop-blur-sm border border-podcast-border text-podcast-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
        <div className="bg-podcast-purple h-2 w-full"></div>
        <CardHeader className="text-center pt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-podcast-green p-3 rounded-full">
              <Podcast className="text-podcast-black" size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-podcast-white">PremiumCast</CardTitle>
          <p className="text-podcast-gray mt-2">
            {authView === 'sign_in' 
              ? 'Acesse sua conta para continuar' 
              : 'Crie uma conta para começar'}
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <Button onClick={handleAdminLogin} disabled={loading} className="w-full mb-4 bg-podcast-purple hover:opacity-90">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Entrar como Administrador
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-podcast-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-podcast-black px-2 text-podcast-gray">
                Ou
              </span>
            </div>
          </div>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view={authView}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha segura',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  confirmation_text: 'Verifique seu e-mail para o link de confirmação',
                  link_text: 'Já tem uma conta? Entre',
                },
                forgotten_password: {
                  email_label: 'E-mail',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                },
              },
            }}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--podcast-green))',
                    brandAccent: 'hsl(var(--podcast-purple))',
                    inputBackground: 'hsl(var(--podcast-black-light))',
                    inputBorder: 'hsl(var(--podcast-border))',
                    inputBorderFocus: 'hsl(var(--podcast-green))',
                    inputPlaceholder: 'hsl(var(--podcast-gray))',
                    inputText: 'hsl(var(--podcast-white))',
                    defaultButtonBackground: 'hsl(var(--podcast-green))',
                    defaultButtonBackgroundHover: 'hsl(var(--podcast-green) / 0.8)',
                    defaultButtonBorder: 'hsl(var(--podcast-green))',
                    defaultButtonText: 'hsl(var(--podcast-black))',
                    anchorTextColor: 'hsl(var(--podcast-green))',
                    anchorTextHoverColor: 'hsl(149 71% 55%)',
                  },
                  space: {
                    buttonPadding: '12px 16px',
                    inputPadding: '12px 16px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                button: 'w-full font-semibold transition-all duration-200 hover:shadow-lg',
                input: 'transition-all duration-200 focus:ring-2 focus:ring-podcast-green/30',
                anchor: 'font-medium transition-colors duration-200',
                divider: 'bg-podcast-border',
                label: 'text-podcast-gray font-medium',
              }
            }}
            theme="dark"
            redirectTo={window.location.origin}
            showLinks={false}
          />
          <div className="text-center mt-4">
            <button
              onClick={() => setAuthView(authView === 'sign_in' ? 'sign_up' : 'sign_in')}
              className="text-sm font-medium text-podcast-green hover:text-green-400 transition-colors duration-200"
            >
              {authView === 'sign_in'
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;