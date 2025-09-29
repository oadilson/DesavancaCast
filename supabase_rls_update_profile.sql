-- Habilitar RLS na tabela profiles (se ainda não estiver habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar uma política para permitir que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Allow authenticated users to update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);