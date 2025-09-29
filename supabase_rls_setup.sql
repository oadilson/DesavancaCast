-- Habilitar RLS na tabela profiles (se ainda não estiver habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam perfis (ajuste conforme necessário)
-- Se você quiser que apenas o próprio usuário veja seu perfil, mude para USING (auth.uid() = id)
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