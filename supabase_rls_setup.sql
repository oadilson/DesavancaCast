-- Habilitar RLS na tabela profiles (se ainda não estiver habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes com os mesmos nomes, se houver
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Política para permitir que todos os usuários autenticados vejam perfis (ajuste conforme necessário)
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

-- Política para permitir que usuários autenticados insiram seu próprio perfil
-- (Geralmente usado em conjunto com um trigger que cria o perfil automaticamente)
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para permitir que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);