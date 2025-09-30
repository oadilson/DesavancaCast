"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: 'O nome é obrigatório.' }),
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface CustomSignUpFormProps {
  onSwitchToSignIn: () => void;
}

const CustomSignUpForm: React.FC<CustomSignUpFormProps> = ({ onSwitchToSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
        },
      },
    });

    if (error) {
      showError(error.message);
    } else if (data.user) {
      showSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
      onSwitchToSignIn();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="firstName" className="text-gray-700 text-sm font-medium">Nome</Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Seu nome"
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-podcast-purple/30 mt-2 h-11"
          {...form.register('firstName')}
        />
        {form.formState.errors.firstName && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email" className="text-gray-700 text-sm font-medium">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-podcast-purple/30 mt-2 h-11"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="relative">
        <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Senha</Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Crie uma senha segura"
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-podcast-purple/30 mt-2 h-11 pr-10"
          {...form.register('password')}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 mt-2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(prev => !prev)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
        {form.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full bg-podcast-purple text-white hover:bg-podcast-purple/90 h-11 text-base font-semibold" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar conta
      </Button>
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-sm font-medium text-podcast-purple hover:text-podcast-purple/80 transition-colors duration-200"
        >
          Já tem uma conta? Entre
        </button>
      </div>
    </form>
  );
};

export default CustomSignUpForm;