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
import { showError } from '@/utils/toast';

const signInSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

interface CustomSignInFormProps {
  onSwitchToSignUp: () => void;
}

const CustomSignInForm: React.FC<CustomSignInFormProps> = ({ onSwitchToSignUp }) => {
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="bg-podcast-border mt-1"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Sua senha"
          className="bg-podcast-border mt-1"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full bg-podcast-green text-podcast-black hover:opacity-90" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-sm font-medium text-podcast-green hover:text-green-400 transition-colors duration-200"
        >
          Não tem uma conta? Cadastre-se
        </button>
      </div>
    </form>
  );
};

export default CustomSignInForm;