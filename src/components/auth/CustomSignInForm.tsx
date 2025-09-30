"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Link } from 'react-router-dom';

const signInSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const CustomSignInForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      showError(error.message);
    }
    // Success is handled by the onAuthStateChange listener in Login.tsx
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    const email = form.getValues('email');
    if (!email || !z.string().email().safeParse(email).success) {
      showError('Por favor, insira um e-mail válido para redefinir a senha.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?view=reset_password`, // Redirecionar para uma página de redefinição de senha
    });
    setIsLoading(false);

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Verifique seu e-mail para o link de redefinição de senha!');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-podcast-white text-sm font-medium">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="bg-podcast-border border-none text-podcast-white placeholder:text-podcast-gray focus:ring-2 focus:ring-podcast-green/30 mt-2 h-11"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password" className="text-podcast-white text-sm font-medium">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Sua senha"
          className="bg-podcast-border border-none text-podcast-white placeholder:text-podcast-gray focus:ring-2 focus:ring-podcast-green/30 mt-2 h-11"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
        )}
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs text-podcast-gray hover:text-podcast-green transition-colors duration-200"
            disabled={isLoading}
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full bg-podcast-green text-podcast-black hover:bg-podcast-green/90 h-11 text-base font-semibold" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>
    </form>
  );
};

export default CustomSignInForm;