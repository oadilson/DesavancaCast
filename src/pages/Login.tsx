import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Podcast } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import CustomSignInForm from '@/components/auth/CustomSignInForm';
import CustomSignUpForm from '@/components/auth/CustomSignUpForm';

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

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-podcast-black"> {/* Adicionado bg-podcast-black aqui */}
      <div
        className="absolute inset-0 opacity-40 blur-sm animate-background-pan" {/* Opacidade aumentada para 40% */}
        style={{
          background: `
            radial-gradient(circle at 20% 80%, hsl(var(--podcast-green) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--podcast-purple) / 0.1) 0%, transparent 50%),
            linear-gradient(to bottom right, hsl(var(--podcast-black-light)), hsl(var(--podcast-black)))
          `,
          backgroundSize: '200% 200%', // Permite que o gradiente se mova
        }}
      ></div>
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