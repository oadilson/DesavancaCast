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
          first_name: values.firstName, // Passar o nome para os metadados do usuário
        },
      },
    });

    if (error) {
      showError(error.message);
    } else if (data.user) {
      // O trigger 'handle_new_user' no Supabase já cuida da criação do perfil com o nome.
      // Não precisamos fazer um upsert aqui.
      showSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
      onSwitchToSignIn(); // Redirecionar para o login após o cadastro
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="firstName">Nome</Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Seu nome"
          className="bg-podcast-border mt-1"
          {...form.register('firstName')}
        />
        {form.formState.errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
        )}
      </div>
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
          placeholder="Crie uma senha segura"
          className="bg-podcast-border mt-1"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full bg-podcast-green text-podcast-black hover:opacity-90" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar conta
      </Button>
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-sm font-medium text-podcast-green hover:text-green-400 transition-colors duration-200"
        >
          Já tem uma conta? Entre
        </button>
      </div>
    </form>
  );
};

export default CustomSignUpForm;