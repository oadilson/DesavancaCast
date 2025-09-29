import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Podcast, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import CustomSignInForm from '@/components/auth/CustomSignInForm';
import CustomSignUpForm from '@/components/auth/CustomSignUpForm';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'sign_up' ? 'sign_up' : 'sign_in';
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>(initialView);
  const [loadingAdminLogin, setLoadingAdminLogin] = useState(false);

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
    setLoadingAdminLogin(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'adilsonsilva@outlook.com',
      password: 'admin',
    });

    if (error) {
      showError('Falha no login de admin. Verifique se o usuário adilsonsilva@outlook.com foi criado com a senha "admin".');
    }
    // O sucesso é tratado pelo onAuthStateChange
    setLoadingAdminLogin(false);
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
          <Button onClick={handleAdminLogin} disabled={loadingAdminLogin} className="w-full mb-4 bg-podcast-purple hover:opacity-90">
            {loadingAdminLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
          {authView === 'sign_in' ? (
            <CustomSignInForm onSwitchToSignUp={() => setAuthView('sign_up')} />
          ) : (
            <CustomSignUpForm onSwitchToSignIn={() => setAuthView('sign_in')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;